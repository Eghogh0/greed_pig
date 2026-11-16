# Greedy Pig Reimagined - CSC 419 Group 5

Greedy Pig is a push-your-luck dice game. Roll as many times as you dare to build up your turn points, then pass to bank them, but roll a 1 and you lose everything from that turn. The first player to reach the target score wins.

We rebuilt the game so that the dice and the scores live on a real server, and added three improvements on top of it.

**Live site:** [add Vercel URL]
**Backend API:** https://greed-pig.onrender.com (the free server sleeps, so the first request can take up to a minute)

## Group members

| Name | Matric No. | Role |
| --- | --- | --- |
| Michelle David | [add matric no.] | Core backend: server-side dice and scores, deployment, README |
| Eghogho Esele | [add matric no.] | Improvement: Enhanced Onboarding (Accessibility and Experience) |
| Aghachi Ebubechukwu | 23120111002 | Improvement: Saved Rooms (Multiplayer and Social) |
| David Nnodu | [add matric no.] | Improvement: Lucky Shield (Gameplay and Rules) |

## Our three improvements

### 1. Lucky Shield (Gameplay and Rules), by David Nnodu

Roll 5 times in a row without rolling a 1 to earn a Lucky Shield. If you later roll a 1 while holding a shield, you choose: use the shield to bank your turn points instead of losing them, or keep the shield for later. Either choice ends your turn.

- **Database:** `supabase/002_lucky_shield.sql` stores each player's streak, shields and pending decision.
- **Backend:** the server rolls the dice and applies the shield rules (`server/src/luckyShield.js`) through `POST /api/games/:id/roll`, `/pass` and `/shield/decision`.
- **Frontend:** the Lucky Shield card shows progress and shields, and a popup asks for the shield decision.

### 2. Saved Rooms (Multiplayer and Social), by Aghachi Ebubechukwu

Pause a long game, get a 6-character room code, and pick it up later with the same scores and turn.

- **How to use:** during a game, click **Pause & save room** and note the code. Later, click **Saved Rooms** on the home screen, enter the code, and click **Resume game** to carry on playing.
- **Database:** `supabase/004_saved_rooms.sql` adds a `paused` status, a unique `room_code` and `paused_at` to the games table.
- **Backend:** `POST /api/games/:id/pause`, `GET /api/rooms/:code` and `POST /api/rooms/:code/resume`. A paused game cannot be rolled or passed until it is resumed.

### 3. Enhanced Onboarding (Accessibility and Experience), by Eghogho Esele

A 5-step interactive guide that shows a brand-new player how to play before they start: rolling, passing, the Lucky Shield and setting up the table.

- **How to use:** the guide opens on the home screen. It can be skipped with one tap or the Esc key, and replayed at any time with the **How to play?** button.
- Keyboard friendly (focus stays inside the guide, Esc closes it) and respects the "reduce motion" setting.

## Core backend (Michelle David)

The original game rolled the dice in the browser, so players could cheat. Now the server rolls the dice, updates the scores and decides the winner, and the frontend only displays what the server sends back.

| Method | Endpoint | What it does |
| --- | --- | --- |
| GET | `/health` | Checks the server is running |
| POST | `/api/games` | Creates a game (`playerNames`, `maxPoints`) |
| GET | `/api/games/:id` | Gets a game with its players and scores |
| POST | `/api/games/:id/roll` | Server rolls the dice for the current player |
| POST | `/api/games/:id/pass` | Banks the turn points and moves to the next player |
| POST | `/api/games/:id/shield/decision` | Use or keep a Lucky Shield after rolling a 1 |
| POST | `/api/games/:id/pause` | Pauses a game and returns its room code |
| GET | `/api/rooms/:code` | Finds a saved room by its code |
| POST | `/api/rooms/:code/resume` | Resumes a paused room |

Every endpoint validates its input (ids, player names, max score, whose turn it is) and returns a clear `{ "error": "..." }` message when something is wrong.

**Tech:** React + Vite + Tailwind (frontend, on Vercel), Node.js + Express (backend, on Render), Supabase Postgres (database).

## How to run

You need Node.js 20 or newer and a Supabase project.

### 1. Database

In the Supabase SQL editor, run these files from the `supabase/` folder in this order:

1. `games.sql`
2. `002_lucky_shield.sql`
3. `003_games_engine.sql`
4. `004_saved_rooms.sql`

### 2. Backend

    cd server
    npm install

Copy `server/.env.example` to `server/.env` and fill in `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (from Supabase → Project Settings → API). Then start the server:

    npm run dev

It runs on http://localhost:4000.

### 3. Frontend

In a second terminal, from the project root:

    npm install
    npm run dev

Create a `.env.local` file in the project root containing `VITE_API_URL=http://localhost:4000`, then open http://localhost:5173.

### 4. Tests

With the backend running, from the `server` folder:

    node --test src/luckyShield.test.js src/roomCode.test.js
    node test-api.mjs
    node test-actions.mjs
    node test-rooms.mjs

## Based on

The original Greedy Pig by Hemephelus: https://github.com/Hemephelus/greed_pig
