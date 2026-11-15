import React, { useEffect } from "react";
import Navbar from "src/components/Navbar";
import { useLiveGameContext } from "src/context/useLiveGameContext";
import PlayerTable from "./components/PlayerTable";
import StatsSection from "./components/StatsSection";
import GameOver from "./GameOver";
import DiceSection from "./components/DiceSection";
import StatsSectionMobile from "./components/StatsSectionMobile";
import CurrentPlayerMobile from "./components/CurrentPlayerMobile";
import DiceSectionMobile from "./components/DiceSectionMobile";
import ShieldDecisionModal from "src/components/ShieldDecisionModal";

import {
  handleShieldDecision,
} from "src/utils/live_game/luckyShield";

export default function LiveGame() {
  const {
  playerData,
  setPlayerData,
  currentPlayer,
  setCurrentPlayer,
  isGameOver,
  setIsGameOver,
  maxPoints,
  setIsContinue,
  pendingShieldPlayer,
  setPendingShieldPlayer,
} = useLiveGameContext();

  useEffect(() => {
    setIsContinue(true)
  }, [])

  
function resolveShieldDecision(useShield) {
  if (pendingShieldPlayer === null) return;

  const cp = pendingShieldPlayer;

  try {
    const result = handleShieldDecision(
      playerData[cp],
      useShield
    );

    const updatedPlayers = [...playerData];
    updatedPlayers[cp] = result.player;

    setPlayerData(updatedPlayers);

    // Close the decision popup
    setPendingShieldPlayer(null);

    if (
      useShield &&
      result.player.total_points >= maxPoints
    ) {
      setIsGameOver(true);
      return;
    }

    // Both options end the turn
    const nextPlayer =
      (cp + 1) % updatedPlayers.length;

    setCurrentPlayer(nextPlayer);
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

  
  return (
    <div className="md:grid md:grid-cols-[minmax(auto,_200px)_1fr_minmax(auto,_200px)] lg:grid-cols-[minmax(auto,_250px)_1fr_minmax(auto,_250px)] xl:grid-cols-[auto_1fr_minmax(auto,_300px)] relative">
      <DiceSection />
      <div className=" space-y-2 p-2">
        <Navbar />
        <PlayerTable playerData={playerData} currentPlayer={currentPlayer} />
      </div>
      <CurrentPlayerMobile playerData={playerData} currentPlayer={currentPlayer}/>
      <DiceSectionMobile />

      <StatsSection playerData={playerData} currentPlayer={currentPlayer} />
      <StatsSectionMobile playerData={playerData} currentPlayer={currentPlayer} />
      {isGameOver ? (
        <GameOver playerData={playerData} currentPlayer={currentPlayer} setIsContinue={setIsContinue} />
      ) : (
        <></>
      )}
      {pendingShieldPlayer !== null && (
      <ShieldDecisionModal
        player={playerData[pendingShieldPlayer]}
        onUseShield={() => resolveShieldDecision(true)}
        onDecline={() => resolveShieldDecision(false)}
      />
      )}
    </div>
  );
}
