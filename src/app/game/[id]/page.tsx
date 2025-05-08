"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "../../contexts/SocketContext";
import { useStory } from "../../contexts/StoryContext";
import GameBoard from "../../components/GameBoard";
import CutScene from "../../components/CutScene";

export default function GamePage() {
  const { gameState, playerRole, isConnected, error } = useSocket();
  const {
    showIntro,
    showEnding,
    introText,
    endingText,
    markIntroAsShown,
    markEndingAsShown,
    triggerIntro,
  } = useStory();
  const router = useRouter();
  const [gameMounted, setGameMounted] = useState(false);

  // Trigger intro cutscene when the game first loads
  useEffect(() => {
    if (isConnected && gameState && !gameMounted) {
      triggerIntro();
      setGameMounted(true);
    }
  }, [isConnected, gameState, gameMounted, triggerIntro]);

  // Redirect if not connected or no game state after a timeout
  useEffect(() => {
    if (!isConnected) {
      const timer = setTimeout(() => {
        if (!isConnected) {
          router.push("/");
        }
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isConnected, router]);

  // Redirect if no game state after connection is established
  useEffect(() => {
    if (gameMounted && !gameState) {
      const timer = setTimeout(() => {
        if (!gameState) {
          router.push("/");
        }
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [gameState, gameMounted, router]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 flex-col">
        <div className="w-full max-w-md text-center bg-white p-6">
          <h2 className="text-xl font-bold mb-4">
            Connecting to game server...
          </h2>
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div className="bg-rose-600 h-2 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 flex-col">
        <div className="w-full max-w-md text-center bg-white p-6">
          <h2 className="text-xl font-bold mb-4 text-red-600">Error</h2>
          <p>{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Return to Lobby
          </button>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 flex-col">
        <div className="w-full max-w-md text-center bg-white p-6">
          <h2 className="text-xl font-bold mb-4">Waiting for game data...</h2>
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div className="bg-rose-600 h-2 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 flex-col">
      {showIntro && <CutScene text={introText} onClose={markIntroAsShown} />}

      {showEnding && <CutScene text={endingText} onClose={markEndingAsShown} />}

      <div className="w-full max-w-4xl text-center mb-2 sm:mb-4"></div>

      <div className="bg-white p-2 sm:p-4 mb-2 sm:mb-4 w-full max-w-4xl text-sm sm:text-base overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div className="mb-1 sm:mb-0">
            <span className="font-bold">Game ID:</span> {gameState.gameId}
          </div>
          <div>
            <span className="font-bold">You are:</span>{" "}
            <span
              className={
                playerRole === "player1" ? "text-violet-700" : "text-pink-700"
              }
            >
              {playerRole === "player1"
                ? gameState.player1Name
                : gameState.player2Name}
            </span>{" "}
            ({playerRole === "player1" ? "Player 1" : "Player 2"})
          </div>
        </div>
      </div>

      <GameBoard
        initialRedPosition={gameState.redPosition}
        initialBluePosition={gameState.bluePosition}
        initialCurrentPlayer={
          gameState.currentPlayer === "player1" ? "player1" : "player2"
        }
        initialDiceValue={gameState.diceValue}
        initialMessage={gameState.gameMessage}
        player1Name={gameState.player1Name}
        player2Name={gameState.player2Name || "Waiting for Player 2..."}
        playerRole={playerRole}
      />
    </div>
  );
}
