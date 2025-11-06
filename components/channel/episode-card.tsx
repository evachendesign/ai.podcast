"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAudioContext } from "./audio-context";

interface EpisodeCardProps {
  episodeId: string;
  createdAt?: string | null;
}

export function EpisodeCard({ episodeId, createdAt }: EpisodeCardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastTriedUrl = useRef<string | null>(null);
  const retried = useRef(false);
  const audioCtx = useAudioContext();

  // Register/unregister this audio element
  useEffect(() => {
    const a = audioRef.current;
    if (a) {
      audioCtx.registerAudio(episodeId, a);
      return () => audioCtx.unregisterAudio(episodeId);
    }
  }, [episodeId, audioCtx]);

  // Eagerly fetch and set the audio src so the native controls are active immediately
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/episodes/${episodeId}/playback-url`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return;
        const url = (data?.playbackUrl as string) || "";
        if (!url) return;
        const a = audioRef.current;
        if (!a) return;
        lastTriedUrl.current = url;
        retried.current = false;
        a.src = url;
      } catch {
        // Silently fail if playback URL fetch fails
      }
    })();
  }, [episodeId]);

  const ensureUrlAndPlay = async () => {
    try {
      const a = audioRef.current;
      if (!a) return;
      // If we already have a URL, try to play; onError will re-presign if expired
      if (a.src) {
        await a.play().catch(() => {});
        return;
      }
      const res = await fetch(`/api/episodes/${episodeId}/playback-url`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return;
      const url = (data?.playbackUrl as string) || "";
      if (!url) return;
      lastTriedUrl.current = url;
      retried.current = false;
      a.src = url;
      await a.play().catch(() => {});
    } catch {
      // Silently fail if playback fails
    }
  };

  const generatedAt = createdAt ? new Date(createdAt) : undefined;

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <audio
            ref={audioRef}
            controls
            className="w-full"
            preload="none"
            onPointerDown={ensureUrlAndPlay}
            onPlay={() => {
              // Pause all other episodes when this one starts playing
              audioCtx.pauseOthers(episodeId);
            }}
            onError={async () => {
              // When playback fails (e.g., expired 403), try to re-presign once and resume
              if (retried.current) return;
              retried.current = true;
              try {
                const res = await fetch(`/api/episodes/${episodeId}/playback-url`);
                const data = await res.json().catch(() => ({}));
                if (!res.ok) return;
                const url = (data?.playbackUrl as string) || "";
                if (!url) return;
                const a = audioRef.current;
                if (!a) return;
                lastTriedUrl.current = url;
                a.src = url;
                await a.play().catch(() => {});
              } catch {}
            }}
          />
        </div>
        {generatedAt && (
          <p className="text-xs text-muted-foreground">Generated at: {generatedAt.toLocaleString()}</p>
        )}
      </CardContent>
    </Card>
  );
}


