"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";

interface AudioContextType {
  isPlaying: boolean;
  toggleAudio: () => void;
  hasInteracted: boolean;
  handleInteraction: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element only once
  useEffect(() => {
    audioRef.current = new Audio("/assets/background_track.opus");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle user interaction status
  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      setIsPlaying(true);
    }
  };

  // Add global event listeners for user interaction
  useEffect(() => {
    const interactionEvents = ["click", "touchstart", "keydown"];

    const handleGlobalInteraction = () => {
      handleInteraction();

      // Remove listeners after first interaction
      interactionEvents.forEach((event) => {
        document.removeEventListener(event, handleGlobalInteraction);
      });
    };

    interactionEvents.forEach((event) => {
      document.addEventListener(event, handleGlobalInteraction);
    });

    return () => {
      interactionEvents.forEach((event) => {
        document.removeEventListener(event, handleGlobalInteraction);
      });
    };
  }, []);

  // Control audio playback based on isPlaying state
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying && hasInteracted) {
      audioRef.current.play().catch((err) => {
        console.error("Error playing audio:", err);
        setIsPlaying(false);
      });
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying, hasInteracted]);

  const toggleAudio = () => {
    handleInteraction();
    setIsPlaying((prev) => !prev);
  };

  return (
    <AudioContext.Provider
      value={{ isPlaying, toggleAudio, hasInteracted, handleInteraction }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};
