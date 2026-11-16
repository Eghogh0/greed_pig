// Tests the Saved Rooms flow against a running server.
// Usage (from the server folder): node test-rooms.mjs   (start the server first)
// Optional: API_URL=https://your-render-url node test-rooms.mjs

const API = process.env.API_URL || "http://localhost:4000";
let failures = 0;

async function call(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

function check(label, condition, extra = "") {
  console.log(`${condition ? "PASS" : "FAIL"}  ${label} ${condition ? "" : extra}`);
  if (!condition) failures++;
}

const roll = (gameId, playerId) => call("POST", `/api/games/${gameId}/roll`, { playerId });
const pass = (gameId, playerId) => call("POST", `/api/games/${gameId}/pass`, { playerId });
const pause = (gameId, playerId) => call("POST", `/api/games/${gameId}/pause`, { playerId });

// ---------- 1. Create a two-player game ----------
const created = await call("POST", "/api/games", {
  playerNames: ["Ada", "Bola"],
  maxPoints: 1000,
});
check("create game", created.status === 201, JSON.stringify(created.data));
let game = created.data;
const playerId = game.players?.[0]?.id;

// ---------- 2. Play until someone has banked points, so we can check they survive ----------
for (let i = 0; i < 40; i++) {
  const turnId = game.current_turn_player_id;
  const r = await roll(game.id, turnId);
  if (r.status !== 200) break;
  game = r.data;
  if (game.lastAction?.needsDecision) {
    game = (await call("POST", `/api/games/${game.id}/shield/decision`, {
      playerId: turnId,
      useShield: true,
    })).data;
  } else if (!game.lastAction?.busted) {
    game = (await pass(game.id, turnId)).data;
  }
  if (game.players.some((p) => p.total_points > 0)) break;
}
const totalsBefore = game.players.map((p) => p.total_points).join(",");
const turnBefore = game.current_turn_player_id;
check("some points were banked before pausing", game.players.some((p) => p.total_points > 0));

// ---------- 3. Pause it and get a room code ----------
const paused = await pause(game.id, playerId);
check("pause returns 200", paused.status === 200, JSON.stringify(paused.data));
check("status is paused", paused.data.status === "paused");
const code = paused.data.room_code;
check("room code is 6 characters", /^[A-Z0-9]{6}$/.test(code ?? ""), String(code));
console.log("      room code:", code);

// ---------- 4. Pausing twice returns the same code ----------
const again = await pause(game.id, playerId);
check("pausing twice keeps the same code", again.data.room_code === code);

// ---------- 5. A paused game cannot be played ----------
const rollPaused = await roll(game.id, turnBefore);
check("roll on a paused game is refused (409)", rollPaused.status === 409, `got ${rollPaused.status}`);
check(
  "refusal says the game is paused",
  /paused/i.test(rollPaused.data.error ?? ""),
  `message was: ${rollPaused.data.error} (add the paused check to loadActionContext)`
);
const passPaused = await pass(game.id, turnBefore);
check("pass on a paused game is refused (409)", passPaused.status === 409, `got ${passPaused.status}`);

// ---------- 6. Find the room by its code (lowercase on purpose) ----------
const found = await call("GET", `/api/rooms/${code.toLowerCase()}`);
check("find room by code", found.status === 200 && found.data.id === game.id);
check("players kept", found.data.players?.length === 2);
check(
  "scores kept while paused",
  found.data.players?.map((p) => p.total_points).join(",") === totalsBefore
);

// ---------- 7. Resume it ----------
const resumed = await call("POST", `/api/rooms/${code}/resume`, {});
check("resume returns in_progress", resumed.data.status === "in_progress", JSON.stringify(resumed.data));
check(
  "scores and turn unchanged after resume",
  resumed.data.players?.map((p) => p.total_points).join(",") === totalsBefore &&
    resumed.data.current_turn_player_id === turnBefore
);

// ---------- 8. The resumed game can be played ----------
const rollAfter = await roll(game.id, resumed.data.current_turn_player_id);
check("roll works after resume", rollAfter.status === 200, JSON.stringify(rollAfter.data));

// ---------- 9. Error cases ----------
const badCode = await call("GET", "/api/rooms/abc");
check("bad code gives 400", badCode.status === 400);
const unknown = await call("GET", "/api/rooms/ZZZZZZ");
check("unknown code gives 404", unknown.status === 404);
const wrongPlayer = await pause(game.id, "00000000-0000-4000-8000-000000000000");
check("player not in game gives 403", wrongPlayer.status === 403);
const badPlayer = await pause(game.id, "not-a-uuid");
check("malformed playerId gives 400", badPlayer.status === 400);

// ---------- 10. A finished game cannot be paused ----------
const quick = await call("POST", "/api/games", { playerNames: ["Solo", "Two"], maxPoints: 10 });
let q = quick.data;
for (let i = 0; i < 300 && q.status === "in_progress"; i++) {
  const id = q.current_turn_player_id;
  const r = await roll(q.id, id);
  if (r.status !== 200) break;
  q = r.data;
  if (q.lastAction?.needsDecision) {
    q = (await call("POST", `/api/games/${q.id}/shield/decision`, { playerId: id, useShield: true })).data;
  }
}
check("quick game finished", q.status === "finished", `status ${q.status}`);
const pauseFinished = await pause(q.id, q.players[0].id);
check("pausing a finished game gives 409", pauseFinished.status === 409, `got ${pauseFinished.status}`);

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
