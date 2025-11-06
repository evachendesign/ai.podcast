"use client";

import { Button } from "@/components/ui/button";
import { Radio, Plus } from "lucide-react";

interface EmptyStateProps {
  onCreateChannel?: () => void;
}

export function EmptyState({ onCreateChannel }: EmptyStateProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="rounded-full bg-primary/10 p-6 mb-6">
          <Radio className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight mb-2">
          No channels yet
        </h2>
        <p className="text-muted-foreground mb-8">
          Create your personalized channel to listen to.
        </p>
        <Button onClick={onCreateChannel} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Create Your First Channel
        </Button>
      </div>
    </div>
  );
}

