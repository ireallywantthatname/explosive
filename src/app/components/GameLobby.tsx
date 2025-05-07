"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "../contexts/SocketContext";

export default function GameLobby() {
  const [playerName, setPlayerName] = useState("");
  const [gameId, setGameId] = useState("");
  const { joinGame, isConnected, error } = useSocket();
  const router = useRouter();

  // Generate a random game ID
  const generateGameId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Handle creating a new game
  const handleCreateGame = () => {
    if (!playerName.trim()) {
      alert("Please enter your name");
      return;
    }

    const newGameId = generateGameId();
    setGameId(newGameId);

    // Join the newly created game
    joinGame(newGameId, playerName);

    // Navigate to the game page
    router.push(`/game/${newGameId}`);
  };

  // Handle joining an existing game
  const handleJoinGame = () => {
    if (!playerName.trim()) {
      alert("Please enter your name");
      return;
    }

    if (!gameId.trim()) {
      alert("Please enter a game ID");
      return;
    }

    // Join the game
    joinGame(gameId, playerName);

    // Navigate to the game page
    router.push(`/game/${gameId}`);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-slate-100">
      {/* <h2 className="text-2xl font-bold text-center mb-6">
        Explosive Game Lobby
      </h2> */}

      {!isConnected && (
        <div className="mb-4 p-2 bg-yellow-100 text-yellow-800">
          Connecting to server...
        </div>
      )}

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-800">Error: {error}</div>
      )}

      <div className="mb-4">
        <label
          htmlFor="playerName"
          className="block text-sm font-medium text-slate-900 mb-1"
        >
          Your Name
        </label>
        <input
          type="text"
          id="playerName"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
          placeholder="Enter your name"
          disabled={!isConnected}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={handleCreateGame}
          disabled={!isConnected || !playerName}
          className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
        >
          Create New Game
        </button>

        <div>
          <label
            htmlFor="gameId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Game ID
          </label>
          <input
            type="text"
            id="gameId"
            value={gameId}
            onChange={(e) => setGameId(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-900 mb-2"
            placeholder="Enter game ID"
            disabled={!isConnected}
          />
          <button
            onClick={handleJoinGame}
            disabled={!isConnected || !playerName || !gameId}
            className="w-full px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Join Game
          </button>
        </div>
      </div>

      <div className="text-sm text-slate-600">
        <p>Instructions:</p>
        <ul className="list-disc pl-5 mt-2">
          <li>Enter your name and create a new game</li>
          <li>Share the game ID with your friend</li>
          <li>Your friend enters their name and the game ID to join</li>
        </ul>
      </div>
    </div>
  );
}
