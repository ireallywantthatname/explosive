"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// Define story paragraphs
const INTRO_STORY =
  "An empty battlefield filled with nothing but dead bodies and untriggered landmines. The story follows two brothers who want to be with their father in his final moments before they themselves have to leave for the war.";

const ENDING_STORY =
  "The quest is over, and Elijah lost his brother along the way. He enters his childhood home, hoping to find his father. But in an unfortunate turn of events, Elijah finds his father dead, murdered in cold blood by some thieves.";

interface StoryContextType {
  showIntro: boolean;
  showEnding: boolean;
  introShown: boolean;
  endingShown: boolean;
  markIntroAsShown: () => void;
  markEndingAsShown: () => void;
  triggerIntro: () => void;
  triggerEnding: () => void;
  introText: string;
  endingText: string;
}

const StoryContext = createContext<StoryContextType>({
  showIntro: false,
  showEnding: false,
  introShown: false,
  endingShown: false,
  markIntroAsShown: () => {},
  markEndingAsShown: () => {},
  triggerIntro: () => {},
  triggerEnding: () => {},
  introText: INTRO_STORY,
  endingText: ENDING_STORY,
});

export function StoryProvider({ children }: { children: ReactNode }) {
  const [showIntro, setShowIntro] = useState<boolean>(false);
  const [showEnding, setShowEnding] = useState<boolean>(false);
  const [introShown, setIntroShown] = useState<boolean>(false);
  const [endingShown, setEndingShown] = useState<boolean>(false);

  const triggerIntro = () => {
    if (!introShown) {
      setShowIntro(true);
    }
  };

  const triggerEnding = () => {
    if (!endingShown) {
      setShowEnding(true);
    }
  };

  const markIntroAsShown = () => {
    setShowIntro(false);
    setIntroShown(true);
  };

  const markEndingAsShown = () => {
    setShowEnding(false);
    setEndingShown(true);
  };

  return (
    <StoryContext.Provider
      value={{
        showIntro,
        showEnding,
        introShown,
        endingShown,
        markIntroAsShown,
        markEndingAsShown,
        triggerIntro,
        triggerEnding,
        introText: INTRO_STORY,
        endingText: ENDING_STORY,
      }}
    >
      {children}
    </StoryContext.Provider>
  );
}

export const useStory = () => useContext(StoryContext);
