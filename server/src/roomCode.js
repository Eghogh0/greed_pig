import { randomInt } from "node:crypto";

export const ROOM_CODE_LENGTH = 6;

// No 0, O, 1 or I, so codes are easy to read out loud
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function isValidRoomCode(code) {
  return typeof code === "string" && /^[A-Z0-9]{6}$/.test(code);
}

export function generateRoomCode() {
  let code = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return code;
}

// Cleans up what a player types: trims spaces and capitalises.
// Returns null if the result is not a valid code.
export function normaliseRoomCode(input) {
  if (typeof input !== "string") return null;
  const code = input.trim().toUpperCase();
  return isValidRoomCode(code) ? code : null;
}