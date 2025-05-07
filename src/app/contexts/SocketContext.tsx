"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type GameState = {
  redPosition: number;
  bluePosition: number;
  currentPlayer: "player1" | "player2";
  diceValue: number | null;
  gameMessage: string;
  player1Name: string;
  player2Name: string;
  gameId: string;
};

type SocketContextType = {
  socket: Socket | null;
  gameState: GameState | null;
  playerRole: "player1" | "player2" | null;
  joinGame: (gameId: string, playerName: string) => void;
  updateGameState: (update: Partial<GameState>) => void;
  isConnected: boolean;
  error: string | null;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  gameState: null,
  playerRole: null,
  joinGame: () => {},
  updateGameState: () => {},
  isConnected: false,
  error: null,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerRole, setPlayerRole] = useState<"player1" | "player2" | null>(
    null
  );
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    // Determine if we're in development or production for socket URL
    const socketUrl =
      process.env.NODE_ENV === "production"
        ? window.location.origin // In production, use the same origin
        : "http://localhost:3000"; // In development, use localhost

    const socketInstance = io(socketUrl);

    socketInstance.on("connect", () => {
      console.log("Socket connected!");
      setIsConnected(true);
      setError(null);
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected!");
      setIsConnected(false);
    });

    socketInstance.on("error", (err) => {
      console.error("Socket error:", err);
      setError(err.message);
    });

    socketInstance.on("gameState", (state: GameState) => {
      console.log("Game state updated:", state);
      setGameState(state);
    });

    socketInstance.on("playerRole", (role: "player1" | "player2") => {
      console.log("Player role assigned:", role);
      setPlayerRole(role);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Function to join a game
  const joinGame = (gameId: string, playerName: string) => {
    if (socket && isConnected) {
      socket.emit("joinGame", { gameId, playerName });
    }
  };

  // Function to update game state
  const updateGameState = (update: Partial<GameState>) => {
    if (socket && isConnected && gameState) {
      socket.emit("gameAction", update);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        gameState,
        playerRole,
        joinGame,
        updateGameState,
        isConnected,
        error,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
