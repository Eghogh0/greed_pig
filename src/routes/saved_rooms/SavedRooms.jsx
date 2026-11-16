import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";

export default function SavedRooms() {
  const [code, setCode] = useState("");
  const [room, setRoom] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resumed, setResumed] = useState(false);
  const navigate = useNavigate();

  // Opens the game screen with this room's players, scores and turn
  function continuePlaying(game) {
    navigate("/live-game/game", { state: { savedRoom: game } });
  }

  const cleanCode = code.trim().toUpperCase();
  const codeLooksValid = /^[A-Z0-9]{6}$/.test(cleanCode);

  async function handleFind(e) {
    e.preventDefault();
    setError("");
    setRoom(null);
    setResumed(false);

    if (!codeLooksValid) {
      setError("Room codes are 6 letters or numbers, like AB3K9Z.");
      return;
    }

    setLoading(true);
    try {
      setRoom(await api.getRoom(cleanCode));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResume() {
    setError("");
    setLoading(true);
    try {
      const game = await api.resumeRoom(cleanCode);
      setRoom(game);
      setResumed(true);
      continuePlaying(game);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold">Saved Rooms</h1>
      <p>Enter your room code to find a paused game and pick up where you left off.</p>

      <form onSubmit={handleFind} className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={6}
          placeholder="AB3K9Z"
          aria-label="Room code"
          className="w-full rounded border p-2 uppercase tracking-widest"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "..." : "Find"}
        </button>
      </form>

      {error && (
        <p role="alert" className="rounded bg-red-100 p-2 text-red-800">
          {error}
        </p>
      )}

      {room && (
        <div className="flex flex-col gap-3 rounded border p-4">
          <p className="font-semibold">
            Room {room.room_code} ({room.status})
          </p>
          <ul>
            {room.players.map((p) => (
              <li key={p.id}>
                {p.player_name}: {p.total_points} points
                {p.id === room.current_turn_player_id ? " (next to play)" : ""}
              </li>
            ))}
          </ul>

          {room.status === "paused" && (
            <button
              onClick={handleResume}
              disabled={loading}
              className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
            >
              Resume game
            </button>
          )}
          {room.status === "in_progress" && (
            <button
              onClick={() => continuePlaying(room)}
              className="rounded bg-black px-4 py-2 text-white"
            >
              Continue playing
            </button>
          )}
          {room.status === "finished" && <p>This game has already finished.</p>}
          {resumed && <p>Game resumed.</p>}
        </div>
      )}
    </div>
  );
}