// Copies a game sent by the server onto the players shown on screen.
// Server players and screen players are matched by seat order (index),
// so each screen player keeps its avatar and tag.
export function applyServerGame(screenPlayers, game) {
  const players = screenPlayers.map((player, index) => {
    const serverPlayer = game.players[index];
    return {
      ...player,
      serverId: serverPlayer.id,
      total_points: serverPlayer.total_points,
      running_points: serverPlayer.running_points,
      consecutive_rolls: serverPlayer.consecutive_rolls,
      shields: serverPlayer.shields,
      pending_decision: serverPlayer.pending_decision,
    };
  });

  // Whose turn it is (or who won, once the game is finished)
  const turnId = game.winner_player_id ?? game.current_turn_player_id;
  const turnIndex = game.players.findIndex((p) => p.id === turnId);

  // The player waiting to choose whether to use their shield, if any
  const pendingIndex = game.players.findIndex((p) => p.pending_decision);

  return {
    players,
    currentPlayer: turnIndex === -1 ? 0 : turnIndex,
    pendingShieldPlayer: pendingIndex === -1 ? null : pendingIndex,
    isGameOver: game.status === "finished",
  };
}

// Saved Rooms: builds the screen players for a game loaded from a room code.
// Avatars are not stored on the server, so each seat gets the default pig for that seat.
export function playersFromSavedRoom(game, pigs, pigNames) {
  const screenPlayers = game.players.map((serverPlayer, index) => ({
    id: serverPlayer.id,
    avatar: pigs[index % pigs.length],
    tag: pigNames[index % pigNames.length],
    name: serverPlayer.player_name,
    pig_index: index % pigs.length,
    running_points: 0,
    total_points: 0,
    consecutiveRolls: 0,
    shields: 0,
    pendingShieldDecision: false,
  }));
  return applyServerGame(screenPlayers, game);
}
