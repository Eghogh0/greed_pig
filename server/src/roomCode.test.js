import test from "node:test";
import assert from "node:assert/strict";
import {
  generateRoomCode,
  isValidRoomCode,
  normaliseRoomCode,
} from "./roomCode.js";

test("generated codes are 6 capital letters or digits", () => {
  for (let i = 0; i < 200; i++) {
    assert.match(generateRoomCode(), /^[A-Z0-9]{6}$/);
  }
});

test("generated codes avoid look-alike characters", () => {
  for (let i = 0; i < 200; i++) {
    assert.doesNotMatch(generateRoomCode(), /[01OI]/);
  }
});

test("codes rarely repeat", () => {
  const codes = new Set();
  for (let i = 0; i < 1000; i++) codes.add(generateRoomCode());
  assert.ok(codes.size >= 990);
});

test("normaliseRoomCode cleans valid input", () => {
  assert.equal(normaliseRoomCode("  ab3k9z "), "AB3K9Z");
});

test("normaliseRoomCode rejects bad input", () => {
  assert.equal(normaliseRoomCode("short"), null);
  assert.equal(normaliseRoomCode("AB3K9!"), null);
  assert.equal(normaliseRoomCode(123456), null);
  assert.equal(isValidRoomCode("ab3k9z"), false);
});