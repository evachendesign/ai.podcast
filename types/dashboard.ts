export interface Channel {
  id: string;                  // text
  createdAt?: Date;            // timestamp
  updatedAt?: Date;            // timestamp
  name: string;                // text
  topic?: string;              // text
  news_url?: string;           // text
  isActive?: boolean;          // boolean
  userId?: string;             // text
  episodeCount?: number;       // computed on list
  description?: string;        // for mock data compatibility
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  provider?: "google" | "github" | "email";
}

export type EpisodeStatus = "queued" | "running" | "succeeded" | "failed";

export interface Episode {
  id: string;                 // text
  createdAt: Date;            // timestamp
  updatedAt: Date;            // timestamp
  title: string | null;       // text (nullable)
  playbackUrl: string | null; // text (nullable)
  durationSec: number | null; // integer
  publishedAt: Date | null;   // timestamp
  channelId: string;          // text (FK to Channel.id)
  script: string;             // text
  status: EpisodeStatus;      // enum
  error: string | null;       // text
}

export interface DashboardState {
  user: User | null;
  channels: Channel[];
  isLoading: boolean;
}

