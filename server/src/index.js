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

// 1. checking the health of the system
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 2. Creating a new game.
app.post("/api/games", async (req, res) => {
  const { playerName } = req.body ?? {};

  // Input validation
  if (typeof playerName !== "string" || playerName.trim().length === 0) {
    return res.status(400).json({ error: "playerName is required" });
  }
  if (playerName.trim().length > 30) {
    return res.status(400).json({ error: "playerName must be 30 characters or fewer" });
  }

  const { data, error } = await supabase
    .from("games")
    .insert({ player_name: playerName.trim() })
    .select()
    .single();

  if (error) {
    console.error("Create game failed:", error.message);
    return res.status(500).json({ error: "Could not create game. Please try again." });
  }

  res.status(201).json(data);
});

// 3. Fetching a game by id.
app.get("/api/games/:id", async (req, res) => {
  const { id } = req.params;

  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(id)) {
    return res.status(400).json({ error: "Invalid game id" });
  }

  const { data, error } = await supabase
    .from("games")
    .select()
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Fetch game failed:", error.message);
    return res.status(500).json({ error: "Could not load game." });
  }
  if (!data) {
    return res.status(404).json({ error: "Game not found" });
  }

  res.json(data);
});

// error control
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Greedy Pig API listening on port ${PORT}`);
});
