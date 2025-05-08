"use client";

import { useState, useEffect } from "react";
import GameBox from "./GameBox";
import DiceRoller from "./DiceRoller";
import { useSocket } from "../contexts/SocketContext";
import { useStory } from "../contexts/StoryContext";
import AnimatedMarker from "./AnimatedMarker";

// Define the box positions with explosive boxes
const explosiveBoxes = [8, 30, 43, 51, 56, 59, 61, 62];

// Define the punishment mapping
const punishmentMap = {
  1: 1, // row 1 -> box 1
  4: 12, // row 4 -> box 12
  5: 25, // row 5 -> box 25
  6: 22, // row 6 -> box 22
  7: 1, // row 7 -> box 1
};

// Function to determine row based on box number
function getRow(boxNumber: number): number {
  if (boxNumber >= 1 && boxNumber <= 9) return 1;
  if (boxNumber >= 10 && boxNumber <= 18) return 2;
  if (boxNumber >= 19 && boxNumber <= 27) return 3;
  if (boxNumber >= 28 && boxNumber <= 36) return 4;
  if (boxNumber >= 37 && boxNumber <= 45) return 5;
  if (boxNumber >= 46 && boxNumber <= 54) return 6;
  if (boxNumber >= 55 && boxNumber <= 63) return 7;
  return 0;
}

type GameBoardProps = {
  initialRedPosition: number;
  initialBluePosition: number;
  initialCurrentPlayer: "player1" | "player2";
  initialDiceValue: number | null;
  initialMessage: string;
  player1Name: string;
  player2Name: string;
  playerRole: "player1" | "player2" | null;
};

export default function GameBoard({
  initialRedPosition = 1,
  initialBluePosition = 1,
  initialCurrentPlayer = "player1",
  initialDiceValue = null,
  initialMessage = "",
  player1Name = "Player 1",
  player2Name = "Player 2",
  playerRole,
}: GameBoardProps) {
  const [redPosition, setRedPosition] = useState(initialRedPosition);
  const [bluePosition, setBluePosition] = useState(initialBluePosition);
  const [currentPlayer, setCurrentPlayer] = useState<"player1" | "player2">(
    initialCurrentPlayer
  );
  const [diceValue, setDiceValue] = useState<number | null>(initialDiceValue);
  const [gameMessage, setGameMessage] = useState<string>(initialMessage);
  const [gameWinner, setGameWinner] = useState<string | null>(null);
  const [showFullscreenMessage, setShowFullscreenMessage] =
    useState<boolean>(false);
  const [isExplosive, setIsExplosive] = useState<boolean>(false);

  // Animation states
  const [redAnimating, setRedAnimating] = useState<boolean>(false);
  const [blueAnimating, setBlueAnimating] = useState<boolean>(false);
  const [redSourcePosition, setRedSourcePosition] =
    useState<number>(initialRedPosition);
  const [blueSourcePosition, setBlueSourcePosition] =
    useState<number>(initialBluePosition);
  const [redTargetPosition, setRedTargetPosition] =
    useState<number>(initialRedPosition);
  const [blueTargetPosition, setBlueTargetPosition] =
    useState<number>(initialBluePosition);

  // Get the socket context
  const { updateGameState, gameState } = useSocket();
  const { triggerEnding } = useStory();

  // Update local state when gameState changes from server
  useEffect(() => {
    if (gameState) {
      // If there's an animation in progress, don't update positions yet
      if (!redAnimating && !blueAnimating) {
        if (redPosition !== gameState.redPosition) {
          setRedSourcePosition(redPosition);
          setRedTargetPosition(gameState.redPosition);
          setRedAnimating(true);
        } else {
          setRedPosition(gameState.redPosition);
        }

        if (bluePosition !== gameState.bluePosition) {
          setBlueSourcePosition(bluePosition);
          setBlueTargetPosition(gameState.bluePosition);
          setBlueAnimating(true);
        } else {
          setBluePosition(gameState.bluePosition);
        }
      }

      setCurrentPlayer(gameState.currentPlayer);
      setDiceValue(gameState.diceValue);
      setGameMessage(gameState.gameMessage);

      // Check if there's an explosion or winner message in the gameState
      if (gameState.showFullscreenMessage) {
        setShowFullscreenMessage(true);
        setIsExplosive(gameState.isExplosive || false);

        // Determine winner if this is a winning message
        if (!gameState.isExplosive) {
          if (gameState.redPosition === 63) {
            setGameWinner(gameState.player1Name);
          } else if (gameState.bluePosition === 63) {
            setGameWinner(gameState.player2Name);
          }
        }
      }
    }
  }, [gameState]);

  // Handle dice roll
  const handleDiceRoll = (value: number) => {
    // Only allow dice roll if it's your turn
    if (
      (currentPlayer === "player1" && playerRole !== "player1") ||
      (currentPlayer === "player2" && playerRole !== "player2")
    ) {
      setGameMessage("It's not your turn!");
      return;
    }

    // Don't allow dice roll if animation is in progress
    if (redAnimating || blueAnimating) {
      return;
    }

    // Update local state
    setDiceValue(value);

    // Calculate new position
    let newPosition =
      currentPlayer === "player1" ? redPosition + value : bluePosition + value;

    // Ensure we don't go beyond the board
    if (newPosition > 63) {
      newPosition = 63;
    }

    // Set source and target positions for animation
    if (currentPlayer === "player1") {
      setRedSourcePosition(redPosition);
      setRedTargetPosition(newPosition);
      setRedAnimating(true);
    } else {
      setBlueSourcePosition(bluePosition);
      setBlueTargetPosition(newPosition);
      setBlueAnimating(true);
    }

    // Create message
    const message = `${
      currentPlayer === "player1" ? player1Name : player2Name
    } moved to box ${newPosition}`;
    setGameMessage(message);

    // Check for win condition
    if (newPosition === 63) {
      const winnerMessage = `${
        currentPlayer === "player1" ? player1Name : player2Name
      } has won the game!`;
      setGameMessage(winnerMessage);
      setGameWinner(currentPlayer === "player1" ? player1Name : player2Name);

      // Wait for animation to complete before showing fullscreen message
      setTimeout(() => {
        setShowFullscreenMessage(true);
        setIsExplosive(false);
      }, 2000);

      // Trigger the ending story when a player wins
      triggerEnding();

      // Update game state with server
      updateGameState({
        redPosition: currentPlayer === "player1" ? newPosition : redPosition,
        bluePosition: currentPlayer === "player1" ? bluePosition : newPosition,
        currentPlayer: currentPlayer === "player1" ? "player2" : "player1",
        diceValue: value,
        gameMessage: winnerMessage,
        showFullscreenMessage: true,
        isExplosive: false,
      });

      return;
    }

    // Check if landed on explosive box
    if (explosiveBoxes.includes(newPosition)) {
      const row = getRow(newPosition);
      const punishment = punishmentMap[row as keyof typeof punishmentMap];

      if (punishment) {
        // Wait for the first animation to complete before showing explosion
        setTimeout(() => {
          // Show fullscreen message for explosive
          setShowFullscreenMessage(true);
          setIsExplosive(true);

          // Add a delay to show landing on explosive box first
          setTimeout(() => {
            const explosiveMessage = `${
              currentPlayer === "player1" ? player1Name : player2Name
            } landed on explosive box and moved to box ${punishment}!`;
            setGameMessage(explosiveMessage);

            // Set up animation for explosive movement
            if (currentPlayer === "player1") {
              setRedSourcePosition(newPosition);
              setRedTargetPosition(punishment);
              setRedAnimating(true);
            } else {
              setBlueSourcePosition(newPosition);
              setBlueTargetPosition(punishment);
              setBlueAnimating(true);
            }

            // Update game state with server after explosion
            updateGameState({
              redPosition:
                currentPlayer === "player1" ? punishment : redPosition,
              bluePosition:
                currentPlayer === "player1" ? bluePosition : punishment,
              currentPlayer:
                currentPlayer === "player1" ? "player2" : "player1",
              diceValue: value,
              gameMessage: explosiveMessage,
              showFullscreenMessage: true,
              isExplosive: true,
            });
          }, 1000);
        }, 2000); // Wait for first animation

        return;
      }
    }

    // Will switch player after animation completes
    // Update game state with server
    updateGameState({
      redPosition: currentPlayer === "player1" ? newPosition : redPosition,
      bluePosition: currentPlayer === "player1" ? bluePosition : newPosition,
      currentPlayer: currentPlayer === "player1" ? "player2" : "player1",
      diceValue: value,
      gameMessage: message,
    });
  };

  // Handle completion of animations
  const handleRedAnimationComplete = () => {
    setRedPosition(redTargetPosition);
    setRedAnimating(false);

    // Switch player if this was a regular move (not an explosive move)
    if (
      currentPlayer === "player1" &&
      !explosiveBoxes.includes(redTargetPosition)
    ) {
      setCurrentPlayer("player2");
    }
  };

  const handleBlueAnimationComplete = () => {
    setBluePosition(blueTargetPosition);
    setBlueAnimating(false);

    // Switch player if this was a regular move (not an explosive move)
    if (
      currentPlayer === "player2" &&
      !explosiveBoxes.includes(blueTargetPosition)
    ) {
      setCurrentPlayer("player1");
    }
  };

  // Generate board - 7 rows x 9 columns, with zigzag pattern
  const generateBoard = () => {
    const board = [];

    // Generate each row
    for (let row = 7; row >= 1; row--) {
      const rowBoxes = [];
      const startBox = row % 2 === 1 ? (row - 1) * 9 + 1 : row * 9;

      // Generate boxes for this row
      for (let i = 0; i < 9; i++) {
        const boxNumber = row % 2 === 1 ? startBox + i : startBox - i;
        rowBoxes.push(
          <GameBox
            key={boxNumber}
            number={boxNumber}
            isExplosive={explosiveBoxes.includes(boxNumber)}
            hasRed={boxNumber === redPosition && !redAnimating}
            hasBlue={boxNumber === bluePosition && !blueAnimating}
            redAnimating={redAnimating}
            blueAnimating={blueAnimating}
          />
        );
      }

      // Add the row with its unique key
      board.push(
        <div
          key={`row-${row}`}
          className="flex flex-row justify-center mb-1 md:mb-2"
        >
          {rowBoxes}
        </div>
      );
    }

    return board;
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      {showFullscreenMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-90">
          <div
            className={`text-center p-8 rounded-lg ${
              isExplosive ? "bg-red-600" : "bg-green-600"
            } w-full h-full max-w-none mx-0 flex flex-col items-center justify-center`}
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
              {isExplosive ? "💥 EXPLOSIVE! 💥" : "🏆 WINNER! 🏆"}
            </h2>
            <p className="text-3xl md:text-4xl text-white mb-8">
              {gameMessage}
            </p>
            {!isExplosive && gameWinner && (
              <p className="text-4xl md:text-5xl font-bold text-white mb-8">
                {gameWinner} has won the game!
              </p>
            )}
            <button
              onClick={() => {
                setShowFullscreenMessage(false);
                // Also update the server state to hide the message for the other player
                if (gameState) {
                  updateGameState({
                    showFullscreenMessage: false,
                  });
                }
              }}
              className="mt-8 px-8 py-4 bg-white text-black text-xl font-bold hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Game status */}
      <div className="flex flex-col md:flex-row justify-between mb-4 p-2 bg-slate-100">
        <div className="mb-2 md:mb-0">
          <span className="font-bold">Current Turn: </span>
          <span
            className={
              currentPlayer === "player1" ? "text-violet-700" : "text-pink-700"
            }
          >
            {currentPlayer === "player1" ? player1Name : player2Name}
          </span>
        </div>
        <div>
          <span className="font-bold">Game Message: </span>
          <span>{gameMessage}</span>
        </div>
      </div>

      {/* Players */}
      <div className="flex flex-col md:flex-row justify-between mb-4 p-2 bg-slate-100">
        <div className="flex items-center mb-2 md:mb-0">
          <div className="w-4 h-4 md:w-6 md:h-6 bg-violet-700 rounded-full mr-2"></div>
          <span className="font-bold">{player1Name}</span>
          {playerRole === "player1" && (
            <span className="ml-1 text-xs">(You)</span>
          )}
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 md:w-6 md:h-6 bg-pink-700 rounded-full mr-2"></div>
          <span className="font-bold">{player2Name}</span>
          {playerRole === "player2" && (
            <span className="ml-1 text-xs">(You)</span>
          )}
        </div>
      </div>

      {/* Game board */}
      <div className="bg-white p-2 md:p-4 mb-4 overflow-x-auto">
        <div className="min-w-max relative">
          {generateBoard()}

          {/* Animated markers */}
          {redAnimating && (
            <AnimatedMarker
              color="red"
              sourcePosition={redSourcePosition}
              targetPosition={redTargetPosition}
              onAnimationComplete={handleRedAnimationComplete}
            />
          )}

          {blueAnimating && (
            <AnimatedMarker
              color="blue"
              sourcePosition={blueSourcePosition}
              targetPosition={blueTargetPosition}
              onAnimationComplete={handleBlueAnimationComplete}
            />
          )}
        </div>
      </div>

      {/* Game controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 p-2 bg-slate-100">
        <DiceRoller
          onRoll={handleDiceRoll}
          value={diceValue}
          disabled={
            gameWinner !== null ||
            redAnimating ||
            blueAnimating ||
            (currentPlayer === "player1" && playerRole !== "player1") ||
            (currentPlayer === "player2" && playerRole !== "player2")
          }
        />

        {gameWinner && (
          <div className="mt-4 md:mt-0 text-xl font-bold text-emerald-600">
            {gameWinner} has won!
          </div>
        )}
      </div>
    </div>
  );
}
