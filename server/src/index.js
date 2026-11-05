// starting point for backend

import "dotenv/config";
import express from "express";
import cors from "cors";
import { supabase } from "./db.js";
 
const app = express();
const PORT = process.env.PORT || 4000;
 
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((url) => url.trim());
 
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
 
// ---------- Constants ----------
 
const MIN_POINTS = 10;
const MAX_POINTS = 1000;
const DEFAULT_POINTS = 100;
 
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
 
// ---------- Helpers ----------
 
// Loads a game with its players (ordered by seat) and each player's shield state.
// Returns { error, game }. game is null if not found.
async function fetchGame(id) {
  const { data, error } = await supabase
    .from("games")
    .select("*, game_players!game_players_game_id_fkey(*), game_player_shields(*)")
    .eq("id", id)
    .maybeSingle();
 
  if (error || !data) return { error, game: null };
 
  const shieldsByPlayer = new Map(
    data.game_player_shields.map((s) => [s.player_key, s])
  );
 
  const players = data.game_players
    .sort((a, b) => a.seat_order - b.seat_order)
    .map((p) => {
      const s = shieldsByPlayer.get(p.id);
      return {
        ...p,
        consecutive_rolls: s?.consecutive_rolls ?? 0,
        shields: s?.shields ?? 0,
        pending_decision: s?.pending_decision ?? false,
      };
    });
 
  const { game_players, game_player_shields, ...game } = data;
  return { error: null, game: { ...game, players } };
}
 
// ---------- Routes ----------
 
// 1. Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});
 
// 2. Create a new game
// Body: { playerNames: string[], maxPoints?: number }
// The old { playerName: string } body still works for a single player.
app.post("/api/games", async (req, res) => {
  const { playerName, playerNames, maxPoints = DEFAULT_POINTS } = req.body ?? {};
 
  const rawNames = Array.isArray(playerNames) ? playerNames : [playerName];
  const names = rawNames.map((n) => (typeof n === "string" ? n.trim() : ""));
 
  if (names.length === 0 || names.some((n) => n.length === 0)) {
    return res
      .status(400)
      .json({ error: "At least one player name is required" });
  }
  if (names.some((n) => n.length > 30)) {
    return res
      .status(400)
      .json({ error: "Player names must be 30 characters or fewer" });
  }
  if (
    !Number.isInteger(maxPoints) ||
    maxPoints < MIN_POINTS ||
    maxPoints > MAX_POINTS
  ) {
    return res.status(400).json({
      error: `maxPoints must be an integer between ${MIN_POINTS} and ${MAX_POINTS}`,
    });
  }
 
  // player_name keeps the first player's name so the old frontend keeps working.
  const { data: game, error: gameError } = await supabase
    .from("games")
    .insert({ player_name: names[0], max_points: maxPoints })
    .select()
    .single();
 
  if (gameError) {
    console.error("Create game failed:", gameError.message);
    return res
      .status(500)
      .json({ error: "Could not create game. Please try again." });
  }
 
  // The database trigger creates each player's shield row automatically.
  const { data: players, error: playersError } = await supabase
    .from("game_players")
    .insert(
      names.map((player_name, seat_order) => ({
        game_id: game.id,
        player_name,
        seat_order,
      }))
    )
    .select();
 
  if (playersError) {
    console.error("Create players failed:", playersError.message);
    await supabase.from("games").delete().eq("id", game.id); // remove the orphan game
    return res
      .status(500)
      .json({ error: "Could not create game. Please try again." });
  }
 
  const firstPlayer = players.find((p) => p.seat_order === 0);
  const { error: turnError } = await supabase
    .from("games")
    .update({ current_turn_player_id: firstPlayer.id })
    .eq("id", game.id);
 
  if (turnError) {
    console.error("Set first turn failed:", turnError.message);
    await supabase.from("games").delete().eq("id", game.id);
    return res
      .status(500)
      .json({ error: "Could not create game. Please try again." });
  }
 
  const result = await fetchGame(game.id);
  if (!result.game) {
    console.error("Load game failed:", result.error?.message);
    return res.status(500).json({ error: "Could not load game." });
  }
 
  res.status(201).json(result.game);
});
 
// 3. Fetch a game by id
app.get("/api/games/:id", async (req, res) => {
  const { id } = req.params;
 
  if (!uuidPattern.test(id)) {
    return res.status(400).json({ error: "Invalid game id" });
  }
 
  const { error, game } = await fetchGame(id);
 
  if (error) {
    console.error("Fetch game failed:", error.message);
    return res.status(500).json({ error: "Could not load game." });
  }
  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }
 
  res.json(game);
});
 
// Roll, pass and shield-decision routes go here next.
 
// ---------- Error handling ----------
 
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});
 
app.listen(PORT, () => {
  console.log(`Greedy Pig API listening on port ${PORT}`);
});