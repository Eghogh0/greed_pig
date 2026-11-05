
export const ROLLS_TO_EARN_SHIELD = 5;

// Called after a dice roll finishes
export function applyLuckyShieldRoll(player, diceValue) {
  if (!Number.isInteger(diceValue) ||
      diceValue < 1 || diceValue > 6) {
    throw new Error("Invalid dice value");
  }

  if (player.pendingShieldDecision) {
    throw new Error("Resolve the shield decision first");
  }

  const updated = {
    ...player,
    consecutiveRolls: player.consecutiveRolls ?? 0,
    shields: player.shields ?? 0,
    pendingShieldDecision: false,
  };

  // Player rolls a 1
  if (diceValue === 1) {
    updated.consecutiveRolls = 0;

    if (updated.shields > 0) {
      // Keep running points until the player decides
      updated.pendingShieldDecision = true;

      return {
        player: updated,
        needsDecision: true,
        earnedShield: false,
      };
    }

    // No shield: lose running points
    updated.running_points = 0;

    return {
      player: updated,
      needsDecision: false,
      earnedShield: false,
    };
  }

  // Successful roll
  updated.running_points += diceValue;

  updated.consecutiveRolls = Math.min(
    updated.consecutiveRolls + 1,
    ROLLS_TO_EARN_SHIELD
  );

  const earnedShield =
    updated.consecutiveRolls === ROLLS_TO_EARN_SHIELD &&
    updated.shields === 0;

  if (earnedShield) {
    updated.shields = 1;
  }

  return {
    player: updated,
    needsDecision: false,
    earnedShield,
  };
}

// Called when player chooses Use or Don't Use
export function handleShieldDecision(player, useShield) {
  if (!player.pendingShieldDecision) {
    throw new Error("No shield decision pending");
  }

  if (typeof useShield !== "boolean") {
    throw new Error("Invalid shield choice");
  }

  if (useShield && player.shields < 1) {
    throw new Error("No shield available");
  }

  const updated = { ...player };

  const pointsSaved = useShield
    ? updated.running_points
    : 0;

  if (useShield) {
    updated.total_points += updated.running_points;
    updated.shields -= 1;
  }

  // Both choices end the turn
  updated.running_points = 0;
  updated.consecutiveRolls = 0;
  updated.pendingShieldDecision = false;

  return {
    player: updated,
    pointsSaved,
  };
}

// Called when the player passes normally
export function applyLuckyShieldPass(player) {
  if (player.pendingShieldDecision) {
    throw new Error("Resolve shield decision first");
  }

  return {
    ...player,
    total_points: player.total_points + player.running_points,
    running_points: 0,
    consecutiveRolls: 0,
    pendingShieldDecision: false,
  };
}
