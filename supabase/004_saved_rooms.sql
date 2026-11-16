-- Saved Rooms: room code + paused state

-- 1. Allow a third status, 'paused'
alter table public.games drop constraint if exists games_status_check;
alter table public.games
  add constraint games_status_check
  check (status in ('in_progress', 'paused', 'finished'));

-- 2. Room code (shared with the other player) and pause time
alter table public.games
  add column if not exists room_code text,
  add column if not exists paused_at timestamptz;

-- 3. Room codes are 6 capital letters or digits, and unique
alter table public.games drop constraint if exists games_room_code_format;
alter table public.games
  add constraint games_room_code_format
  check (room_code is null or room_code ~ '^[A-Z0-9]{6}$');

create unique index if not exists games_room_code_key
  on public.games (room_code);
