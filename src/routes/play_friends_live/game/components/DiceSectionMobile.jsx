import React, { useState } from 'react'
import { useLiveGameContext } from 'src/context/useLiveGameContext';
import Menu from "./Menu";
import { Dice } from "src/components/Dice";
import addPlayerSound from "src/sound_effect/add_player.mp3";
import loseSound from "src/sound_effect/lose_sound.mp3";
import celebrationSound from "src/sound_effect/celebration.mp3";
import useAudio from "src/hooks/useAudio";
import LuckyShield from "src/components/LuckyShield";

import {
  applyLuckyShieldRoll,
  applyLuckyShieldPass,
} from "src/utils/live_game/luckyShield";


function DiceSectionMobile() {
  const {
    playerData,
    setPlayerData,
    setChangeBackground,
    currentPlayer,
    setCurrentPlayer,
    maxPoints,
    setIsGameOver,
    setDiceValue,
    pendingShieldPlayer,
    setPendingShieldPlayer,
  } = useLiveGameContext();
  const [isRolling, setIsRolling] = useState(false)
  const addPlayerAudio = useAudio(addPlayerSound);
  const loseAudio = useAudio(loseSound);
  const celebrationAudio = useAudio(celebrationSound);

  const handlePassClick = (event) => {
  event.preventDefault();

  if (isRolling || pendingShieldPlayer !== null) {
    return;
  }

  addPlayerAudio?.play();

  const updatedPlayers = [...playerData];

  const updatedPlayer = applyLuckyShieldPass(
    playerData[currentPlayer]
  );

  updatedPlayers[currentPlayer] = updatedPlayer;
  setPlayerData(updatedPlayers);

  // A player can also win by banking normally
  if (updatedPlayer.total_points >= maxPoints) {
    celebrationAudio?.play();
    setIsGameOver(true);
    return;
  }

  const nextPlayer =
    (currentPlayer + 1) % playerData.length;

  setCurrentPlayer(nextPlayer);
};

 

  function setGameOverPage(
    diceValue,
    playerData,
    currentPlayer,
    maxPoints,
    setIsGameOver,
    celebrationAudio
  ) {
    let currentPoint =
      playerData[currentPlayer].running_points +
      playerData[currentPlayer].total_points +
      diceValue;
    let interval
    let endRoll = 0
  
    if (currentPoint >= maxPoints) {
      interval = setInterval(() => {
        if (endRoll < 10) {
          endRoll++;
        } else {
          celebrationAudio?.play()
          setIsGameOver(true);
          clearInterval(interval);
        }
      }, 100);
    }
  }
  

  
function handleFinalDiceValue(diceValue) {
  // Do not allow another roll during a decision
  if (pendingShieldPlayer !== null) return;

  const cp = currentPlayer;

  const result = applyLuckyShieldRoll(
    playerData[cp],
    diceValue
  );

  const updatedPlayers = [...playerData];
  updatedPlayers[cp] = result.player;

  setPlayerData(updatedPlayers);
  setDiceValue(diceValue);

  // Player rolled a 1
  if (diceValue === 1) {
    if (result.needsDecision) {
      // Keep player and points unchanged until choice
      setPendingShieldPlayer(cp);
      return;
    }

    // No shield available: normal penalty
    loseAudio?.play();

    const nextPlayer =
      (cp + 1) % playerData.length;

    setCurrentPlayer(nextPlayer);
    return;
  }

  // Player successfully earned a shield
  if (result.earnedShield) {
    console.log(
      "Lucky Shield earned by",
      result.player.name || result.player.tag
    );
  }

  const currentPoints =
    result.player.total_points +
    result.player.running_points;

  if (currentPoints >= maxPoints) {
    celebrationAudio?.play();
    setIsGameOver(true);
  }
}



  return (
    <div className=" border-r-[#ffffff40] border-r md:hidden flex flex-col items-center justify-around px-2 bg-[#00000010] h-[60vh] ">
         <a
          href={"#" + (currentPlayer % playerData.length)}
          className="bg-[#056FA480] w-[200px] md:w-full  text-white text-center text-base lg:text-xl xl:text-2xl font-semibold py-2 lg:py-4 rounded border hover:scale-105 active:scale-100 duration-300"
          onClick={handlePassClick}
        >
          PASS
        </a>

        <Dice
          getFinalDiceValue={handleFinalDiceValue}
          setIsRolling={setIsRolling}
          isRolling={
          isRolling || pendingShieldPlayer !== null
          }
          setChangeBackground={setChangeBackground}
        />
        <LuckyShield
          player={playerData[currentPlayer]}
        />
      
      
        <Menu />
        <div className="text-white flex justify-between w-full">
          <p className="text-center text-sm lg:text-lg">{playerData.length} players</p>
          <p className="text-center text-sm  lg:text-lg">{maxPoints} max points</p>
        </div>
      </div>
  )
}


export default DiceSectionMobile