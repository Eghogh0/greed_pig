import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "src/utils/api";
import { useLiveGameContext } from "src/context/useLiveGameContext";

// Saved Rooms: pauses the current game on the server and shows its room code,
// so the players can come back later and resume from the Saved Rooms page.
export default function PauseRoomButton() {
  const { gameId, playerData, currentPlayer, isGameOver } = useLiveGameContext();

  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  // Nothing to pause if there is no server game or it has finished
  if (!gameId || isGameOver) return null;

  async function handlePause() {
    setError("");
    const playerId = playerData[currentPlayer]?.serverId;
    if (!playerId) {
      setError("No game found. Go back to setup and start a new game.");
      return;
    }

    setIsBusy(true);
    try {
      const game = await api.pauseGame(gameId, playerId);
      setRoomCode(game.room_code);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
    } catch {
      // Clipboard can be blocked; the code is still shown on screen
    }
  }

  return (
    <>
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={handlePause}
          disabled={isBusy}
          className="rounded-lg bg-[#D30CBD80] px-4 py-2 text-sm font-bold text-white duration-300 hover:bg-[#D30CBD] disabled:opacity-50"
        >
          {isBusy ? "Saving..." : "Pause & save room"}
        </button>
        {error && (
          <p role="alert" className="rounded bg-red-100 px-2 py-1 text-sm text-red-800">
            {error}
          </p>
        )}
      </div>

      {roomCode && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="room-saved-title"
            className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 text-center text-white shadow-2xl"
          >
            <h2 id="room-saved-title" className="text-2xl font-extrabold">
              Game saved!
            </h2>
            <p className="mt-3 text-gray-300">
              Write down this room code. Enter it on the Saved Rooms page to resume
              with the same scores and turn.
            </p>

            <p className="my-5 rounded-xl bg-slate-800 p-4 font-mono text-4xl tracking-[0.3em]">
              {roomCode}
            </p>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                onClick={handleCopy}
                className="rounded-lg bg-white/10 px-4 py-2 font-bold hover:bg-white/20"
              >
                {copied ? "Copied!" : "Copy code"}
              </button>
              <Link
                to="/saved-rooms"
                className="rounded-lg bg-[#D30CBD] px-4 py-2 font-bold hover:bg-[#b00a9d]"
              >
                Go to Saved Rooms
              </Link>
              <Link
                to="/"
                className="rounded-lg bg-white/10 px-4 py-2 font-bold hover:bg-white/20"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
