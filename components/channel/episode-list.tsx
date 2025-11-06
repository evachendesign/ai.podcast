"use client";

import { useState, useEffect } from "react";
import { EpisodeCard } from "./episode-card";
import { AudioProvider } from "./audio-context";

type Episode = {
  id: string;
  status: string;
  createdAt?: string | null;
  audioKey?: string | null;
};

export function EpisodeList({ initialEpisodes }: { initialEpisodes: Episode[] }) {
  // Only show READY episodes initially
  const readyEpisodes = initialEpisodes.filter((e) => e.status === "READY");
  const [episodes, setEpisodes] = useState<Episode[]>(readyEpisodes);

  useEffect(() => {
    const handler = ((e: CustomEvent) => {
      const newEpisode = e.detail as Episode;
      // Only add if READY and not already in the list
      if (newEpisode.status === "READY") {
        setEpisodes((prev) => {
          if (prev.find((ep) => ep.id === newEpisode.id)) {
            return prev;
          }
          return [newEpisode, ...prev];
        });
      }
    }) as EventListener;

    window.addEventListener("episodeReady", handler);
    return () => window.removeEventListener("episodeReady", handler);
  }, []);

  return (
    <AudioProvider>
      <div className="space-y-4">
        {episodes.map((e) => (
          <EpisodeCard
            key={e.id}
            episodeId={e.id}
            createdAt={e.createdAt}
          />
        ))}
        {episodes.length === 0 && (
          <p className="text-sm text-muted-foreground">No episodes yet. Click &quot;Generate&quot; to create your first episode!</p>
        )}
      </div>
    </AudioProvider>
  );
}

