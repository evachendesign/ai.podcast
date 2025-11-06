"use client";

import { createContext, useContext, useRef, ReactNode } from "react";

type AudioContextType = {
  registerAudio: (id: string, audioEl: HTMLAudioElement) => void;
  unregisterAudio: (id: string) => void;
  pauseOthers: (id: string) => void;
};

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const audiosRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const registerAudio = (id: string, audioEl: HTMLAudioElement) => {
    audiosRef.current.set(id, audioEl);
  };

  const unregisterAudio = (id: string) => {
    audiosRef.current.delete(id);
  };

  const pauseOthers = (id: string) => {
    audiosRef.current.forEach((audio, key) => {
      if (key !== id && !audio.paused) {
        audio.pause();
      }
    });
  };

  return (
    <AudioContext.Provider value={{ registerAudio, unregisterAudio, pauseOthers }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudioContext() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudioContext must be used within AudioProvider");
  return ctx;
}

