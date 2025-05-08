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

  // Show loading message if not connected or no game state yet
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-6 w-full max-w-lg text-center">
          <p className="mb-2">Connecting to server...</p>
          <p className="text-sm text-gray-500">
            If you are not redirected in a few seconds, please go back and try
            again.
          </p>
        </div>
      </div>
    );
  }

  // Show connection error message if there is one
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-6 w-full max-w-lg text-center">
          <p className="text-red-500 mb-2">Error: {error}</p>
          <p className="text-sm">
            Please go back and try again, or create a new game.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show waiting message if no game state yet
  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-6 w-full max-w-lg text-center">
          <p className="mb-2">
            Waiting for game state... The game ID might be invalid.
          </p>
          <p className="text-sm text-gray-500">
            If you are not redirected in a few seconds, please go back and try
            again.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 flex-col">
      {showIntro && (
        <CutScene
          text={introText}
          onClose={markIntroAsShown}
          soundType="intro"
        />
      )}

      {showEnding && (
        <CutScene
          text={endingText}
          onClose={markEndingAsShown}
          soundType="reveal"
        />
      )}

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
