"use client";

import { GenerateButton } from "./generate-button";

export function ChannelGenerateSection({ channelId }: { channelId: string }) {
  return (
    <GenerateButton
      channelId={channelId}
      onReady={(result) => {
        // Dispatch a custom event so the episode list can add the new card
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("episodeReady", {
              detail: {
                id: result.episodeId,
                status: "READY",
                audioKey: result.audioKey,
                createdAt: new Date().toISOString(),
              },
            })
          );
        }
      }}
    />
  );
}


