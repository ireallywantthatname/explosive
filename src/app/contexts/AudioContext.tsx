"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type AudioType = "intro" | "dice_role" | "explosion" | "victory" | "reveal";

interface AudioContextType {
  playSound: (soundType: AudioType) => void;
}

const AudioContext = createContext<AudioContextType>({
  playSound: () => {},
});

export function AudioProvider({ children }: { children: ReactNode }) {
  const [audioElements, setAudioElements] = useState<
    Record<AudioType, HTMLAudioElement | null>
  >({
    intro: null,
    dice_role: null,
    explosion: null,
    victory: null,
    reveal: null,
  });

  useEffect(() => {
    // Initialize audio elements on client-side only
    if (typeof window !== "undefined") {
      setAudioElements({
        intro: new Audio("/assets/intro.opus"),
        dice_role: new Audio("/assets/dice_role.opus"),
        explosion: new Audio("/assets/explosion.opus"),
        victory: new Audio("/assets/victory.opus"),
        reveal: new Audio("/assets/reveal.opus"),
      });
    }
  }, []);

  const playSound = (soundType: AudioType) => {
    const audioElement = audioElements[soundType];
    if (audioElement) {
      // Stop and reset the audio before playing
      audioElement.pause();
      audioElement.currentTime = 0;

      // Play the audio
      audioElement.play().catch((error) => {
        console.error(`Error playing ${soundType} sound:`, error);
      });
    }
  };

  return (
    <AudioContext.Provider
      value={{
        playSound,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export const useAudio = () => useContext(AudioContext);
