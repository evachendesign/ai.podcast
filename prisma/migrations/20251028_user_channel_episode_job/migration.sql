-- Prisma Migration: user_channel_episode_job
-- NOTE: Review carefully before applying in production.

-- 1) Enums
CREATE TYPE "EpisodeStatus" AS ENUM ('queued', 'running', 'succeeded', 'failed');
CREATE TYPE "JobStatus" AS ENUM ('queued', 'running', 'succeeded', 'failed');

-- 2) Users
CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "clerkUserId" TEXT,
  "isGuest" BOOLEAN NOT NULL DEFAULT TRUE,
  "email" TEXT,
  "displayName" TEXT
);
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "User" ("clerkUserId");
CREATE INDEX "User_email_idx" ON "User" ("email");

-- 3) Channel: physical rename description->topic; backfill news_url from crawlUrls; add userId; add flags and constraints
-- 3.1 Add new columns as nullable, then backfill, then set NOT NULL
ALTER TABLE "Channel" ADD COLUMN IF NOT EXISTS "topic" TEXT;
ALTER TABLE "Channel" ADD COLUMN IF NOT EXISTS "news_url" TEXT;
ALTER TABLE "Channel" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT TRUE;
ALTER TABLE "Channel" ADD COLUMN IF NOT EXISTS "userId" TEXT;

-- 3.2 Backfill topic from description
UPDATE "Channel" SET "topic" = COALESCE("description", '') WHERE "topic" IS NULL;

-- 3.3 Backfill news_url from crawlUrls (text[], join with comma)
UPDATE "Channel"
SET "news_url" = COALESCE(
  CASE
    WHEN "crawlUrls" IS NULL OR array_length("crawlUrls", 1) IS NULL THEN ''
    ELSE array_to_string("crawlUrls", ',')
  END,
  ''
) WHERE "news_url" IS NULL OR "news_url" = '';

-- 3.4 Enforce NOT NULL on topic and news_url
ALTER TABLE "Channel" ALTER COLUMN "topic" SET NOT NULL;
ALTER TABLE "Channel" ALTER COLUMN "news_url" SET NOT NULL;

-- 3.5 Remove legacy unique on name to allow composite unique later
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Channel_name_key') THEN
    DROP INDEX "public"."Channel_name_key";
  END IF;
END $$;

-- 3.6 Drop old columns after backfill
ALTER TABLE "Channel" DROP COLUMN IF EXISTS "description";
ALTER TABLE "Channel" DROP COLUMN IF EXISTS "crawlUrls";

-- 3.7 Indexes and (userId, name) uniqueness (userId must be backfilled by app or via reset)
CREATE INDEX IF NOT EXISTS "Channel_userId_idx" ON "Channel" ("userId");
CREATE INDEX IF NOT EXISTS "Channel_isActive_idx" ON "Channel" ("isActive");
CREATE UNIQUE INDEX IF NOT EXISTS "Channel_userId_name_key" ON "Channel" ("userId", "name");

-- 4) Episode shape updates
-- 4.1 Add new columns
ALTER TABLE "Episode" ADD COLUMN IF NOT EXISTS "script" TEXT;
ALTER TABLE "Episode" ADD COLUMN IF NOT EXISTS "status" "EpisodeStatus";
ALTER TABLE "Episode" ADD COLUMN IF NOT EXISTS "error" TEXT;

-- 4.2 Backfill required columns with safe defaults when NULL
UPDATE "Episode" SET "script" = COALESCE("description", '') WHERE "script" IS NULL;
UPDATE "Episode" SET "status" = 'queued' WHERE "status" IS NULL;
UPDATE "Episode" SET "audioUrl" = COALESCE("audioUrl", '') WHERE "audioUrl" IS NULL;

-- 4.3 Enforce NOT NULL and drop old column
ALTER TABLE "Episode" ALTER COLUMN "script" SET NOT NULL;
ALTER TABLE "Episode" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "Episode" ALTER COLUMN "audioUrl" SET NOT NULL;
ALTER TABLE "Episode" DROP COLUMN IF EXISTS "description";

-- 4.4 Indexes
CREATE INDEX IF NOT EXISTS "Episode_channelId_idx" ON "Episode" ("channelId");
CREATE INDEX IF NOT EXISTS "Episode_status_idx" ON "Episode" ("status");

-- 5) Jobs table
CREATE TABLE "Job" (
  "id" TEXT PRIMARY KEY,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "channelId" TEXT NOT NULL,
  "episodeId" TEXT,
  "status" "JobStatus" NOT NULL DEFAULT 'queued',
  "type" TEXT NOT NULL DEFAULT 'channel_generation',
  "payload" JSONB NOT NULL,
  "result" JSONB,
  "error" TEXT,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "maxAttempts" INTEGER NOT NULL DEFAULT 1,
  "priority" INTEGER NOT NULL DEFAULT 0,
  "dedupeKey" TEXT,
  "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "startedAt" TIMESTAMP(3),
  "finishedAt" TIMESTAMP(3)
);
CREATE INDEX "Job_channelId_idx" ON "Job" ("channelId");
CREATE INDEX "Job_status_priority_queuedAt_idx" ON "Job" ("status", "priority", "queuedAt");

-- Optional dedupe guard (partial unique index): at most one active job per channel
-- Note: Prisma schema does not express partial indexes; apply manually and maintain via SQL
CREATE UNIQUE INDEX IF NOT EXISTS job_unique_active_per_channel
ON "Job" ("channelId", "status")
WHERE status IN ('queued','running');

-- 6) Foreign keys
ALTER TABLE "Channel"
  ADD CONSTRAINT "Channel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Job"
  ADD CONSTRAINT "Job_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Job"
  ADD CONSTRAINT "Job_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode" ("id") ON DELETE SET NULL ON UPDATE CASCADE;


