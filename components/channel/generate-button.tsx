"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

type GenerateResult = { jobId: string; episodeId: string; status: string; audioKey?: string | null } | null;

export function GenerateButton({ channelId, onDone, onReady }: { channelId: string; onDone?: (res: GenerateResult) => void; onReady?: (res: NonNullable<GenerateResult>) => void }) {
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [lastResult, setLastResult] = useState<GenerateResult>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<{ stop: boolean }>({ stop: false });

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/channels/${channelId}/generate`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = typeof data?.error === "string" ? data.error : "Generation failed";
        throw new Error(msg);
      }
      setLastResult(data as GenerateResult);
      startTransition(() => {
        onDone?.(data as GenerateResult);
      });
    } finally {
      setLoading(false);
    }
  };

  const busy = loading || isPending;

  // Poll episode status every 3s until READY/FAILED; cancel on unmount or new run
  useEffect(() => {
    const episodeId = lastResult?.episodeId;
    if (!episodeId) return;

    pollRef.current.stop = false;
    setStatus(null);
    setError(null);

    let timeout: ReturnType<typeof setTimeout> | undefined;

    const tick = async () => {
      if (pollRef.current.stop) return;
      try {
        const res = await fetch(`/api/episodes/${episodeId}/status`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(typeof data?.error === "string" ? data.error : `Status check failed (${res.status})`);
          pollRef.current.stop = true;
          return;
        }
        const s = (data?.status as string) || null;
        setStatus(s);
        if (s === "READY") {
          const ak = (data?.audioKey as string) || null;
          pollRef.current.stop = true;
          const payload = { 
            jobId: lastResult?.jobId ?? "", 
            episodeId: lastResult?.episodeId ?? "", 
            status: "READY", 
            audioKey: ak 
          } as NonNullable<GenerateResult>;
          onReady?.(payload);
          onDone?.(payload);
          return;
        }
        if (s === "FAILED" || typeof data?.error === "string") {
          setError((data?.error as string) || "Episode failed");
          pollRef.current.stop = true;
          return;
        }
      } catch (e) {
        const err = e as Error;
        setError(err?.message ?? "Unexpected error");
        pollRef.current.stop = true;
        return;
      }
      timeout = setTimeout(tick, 3000);
    };

    timeout = setTimeout(tick, 0);

    return () => {
      pollRef.current.stop = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [lastResult?.episodeId]);

  // Determine if we're currently generating
  const isGenerating = busy || (status !== null && status !== "FAILED" && status !== "READY");
  
  const buttonLabel = isGenerating ? "Generating" : "Generate a new episode";

  return (
    <div className="flex items-center gap-4">
      <Button 
        onClick={handleClick} 
        disabled={isGenerating} 
        className="gap-2"
      >
        {buttonLabel}
      </Button>
      
      {isGenerating && !error && (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-foreground">
            Status: {status || "Starting..."}
          </span>
          <span className="text-xs text-muted-foreground">
            This may take up to 3 minutes. The AI agent is working hard to search news and generate summary.
          </span>
        </div>
      )}
      
      {error && (
        <span className="text-sm text-destructive">{error}</span>
      )}
    </div>
  );
}


