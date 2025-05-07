"use client";
import GameLobby from "./components/GameLobby";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 flex-col">
      <div className="w-full max-w-4xl text-center mb-8">
        <h1 className="text-4xl font-bold">Explosive</h1>
      </div>
      <GameLobby />
    </div>
  );
}
