"use client";

import { ChannelCard } from "./channel-card";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";

export interface Channel {
  id: string;
  name: string;
  description?: string;
  episodeCount?: number;
}

interface ChannelGridProps {
  channels: Channel[];
  onGoToChannel?: (id: string) => void;
  onCreateChannel?: () => void;
}

export function ChannelGrid({ channels, onGoToChannel, onCreateChannel }: ChannelGridProps) {
  return (
    <div className="mx-auto w-full max-w-6xl py-8 px-4 md:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Your Channels</h1>
        <p className="text-muted-foreground">
          Manage and listen to your personalized podcast channels
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Create New Channel Card */}
        <Card className="group transition-all hover:shadow-lg hover:border-primary/50 border-dashed border-2">
          <button
            type="button"
            onClick={onCreateChannel}
            aria-label="Create a new channel"
            className="flex h-full w-full flex-col items-center justify-center gap-3 p-6"
          >
            <div className="rounded-lg border border-dashed p-6 group-hover:border-primary/60">
              <Plus className="h-10 w-10 text-muted-foreground group-hover:text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground group-hover:text-primary">
              Create a new channel
            </span>
          </button>
        </Card>

        {channels.map((channel) => (
          <ChannelCard
            key={channel.id}
            id={channel.id}
            name={channel.name}
            description={channel.description}
            episodeCount={channel.episodeCount}
            onGoToChannel={onGoToChannel}
          />
        ))}
      </div>
    </div>
  );
}

