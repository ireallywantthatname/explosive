"use client";

import { useState, useEffect } from "react";
import GameBox from "./GameBox";
import DiceRoller from "./DiceRoller";
import { useSocket } from "../contexts/SocketContext";

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

  // Get the socket context
  const { updateGameState, gameState } = useSocket();

  // Update local state when gameState changes from server
  useEffect(() => {
    if (gameState) {
      setRedPosition(gameState.redPosition);
      setBluePosition(gameState.bluePosition);
      setCurrentPlayer(gameState.currentPlayer);
      setDiceValue(gameState.diceValue);
      setGameMessage(gameState.gameMessage);
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

    // Update local state
    setDiceValue(value);

    // Calculate new position
    let newPosition =
      currentPlayer === "player1" ? redPosition + value : bluePosition + value;

    // Ensure we don't go beyond the board
    if (newPosition > 63) {
      newPosition = 63;
    }

    // Update player position
    if (currentPlayer === "player1") {
      setRedPosition(newPosition);
    } else {
      setBluePosition(newPosition);
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

      // Update game state with server
      updateGameState({
        redPosition: currentPlayer === "player1" ? newPosition : redPosition,
        bluePosition: currentPlayer === "player1" ? bluePosition : newPosition,
        currentPlayer: currentPlayer === "player1" ? "player2" : "player1",
        diceValue: value,
        gameMessage: winnerMessage,
      });

      return;
    }

    // Check if landed on explosive box
    if (explosiveBoxes.includes(newPosition)) {
      const row = getRow(newPosition);
      const punishment = punishmentMap[row as keyof typeof punishmentMap];

      if (punishment) {
        // Add a delay to show landing on explosive box first
        setTimeout(() => {
          const explosiveMessage = `${
            currentPlayer === "player1" ? player1Name : player2Name
          } landed on explosive box and moved to box ${punishment}!`;
          setGameMessage(explosiveMessage);

          // Update position after explosion
          if (currentPlayer === "player1") {
            setRedPosition(punishment);
          } else {
            setBluePosition(punishment);
          }

          // Update game state with server after explosion
          updateGameState({
            redPosition: currentPlayer === "player1" ? punishment : redPosition,
            bluePosition:
              currentPlayer === "player1" ? bluePosition : punishment,
            currentPlayer: currentPlayer === "player1" ? "player2" : "player1",
            diceValue: value,
            gameMessage: explosiveMessage,
          });
        }, 1000);

        return;
      }
    }

    // Switch player
    const nextPlayer = currentPlayer === "player1" ? "player2" : "player1";
    setCurrentPlayer(nextPlayer);

    // Update game state with server
    updateGameState({
      redPosition: currentPlayer === "player1" ? newPosition : redPosition,
      bluePosition: currentPlayer === "player1" ? bluePosition : newPosition,
      currentPlayer: nextPlayer,
      diceValue: value,
      gameMessage: message,
    });
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
            hasRed={boxNumber === redPosition}
            hasBlue={boxNumber === bluePosition}
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
    <div className="w-full max-w-4xl mx-auto">
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
        <div className="min-w-max">{generateBoard()}</div>
      </div>

      {/* Game controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 p-2 bg-slate-100">
        <DiceRoller
          onRoll={handleDiceRoll}
          value={diceValue}
          disabled={
            gameWinner !== null ||
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
