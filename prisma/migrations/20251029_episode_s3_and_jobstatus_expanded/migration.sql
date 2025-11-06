-- Migration: episode uses S3 keys/URLs; expand JobStatus lifecycle
-- NOTE: Review carefully before applying in production.

-- 1) Episode: add audioKey/playbackUrl, backfill playbackUrl from audioUrl, then drop audioUrl
ALTER TABLE "Episode" ADD COLUMN IF NOT EXISTS "audioKey" TEXT;
ALTER TABLE "Episode" ADD COLUMN IF NOT EXISTS "playbackUrl" TEXT;

-- Preserve existing playable URLs, if any
UPDATE "Episode" SET "playbackUrl" = "audioUrl" WHERE "audioUrl" IS NOT NULL;

-- Remove legacy column
ALTER TABLE "Episode" DROP COLUMN IF EXISTS "audioUrl";

-- 2) JobStatus enum expansion (replace old enum and migrate values)
-- Create the new enum with expanded states
CREATE TYPE "JobStatus_new" AS ENUM (
  'QUEUED',
  'FETCHING',
  'SUMMARIZING',
  'WRITING_SCRIPT',
  'SYNTHESIZING_AUDIO',
  'UPLOADING',
  'COMPLETE',
  'FAILED'
);

-- Drop default temporarily to change type
ALTER TABLE "Job" ALTER COLUMN "status" DROP DEFAULT;

-- Migrate existing values to new enum (best-effort mapping)
ALTER TABLE "Job" ALTER COLUMN "status" TYPE "JobStatus_new" USING (
  CASE "status"
    WHEN 'queued'    THEN 'QUEUED'::"JobStatus_new"
    WHEN 'running'   THEN 'FETCHING'::"JobStatus_new"   -- aggregate previous running into first active phase
    WHEN 'succeeded' THEN 'COMPLETE'::"JobStatus_new"
    WHEN 'failed'    THEN 'FAILED'::"JobStatus_new"
  END
);

-- Replace the type
DROP TYPE "JobStatus";
ALTER TYPE "JobStatus_new" RENAME TO "JobStatus";

-- Reinstate default
ALTER TABLE "Job" ALTER COLUMN "status" SET DEFAULT 'QUEUED';

-- 3) Update partial unique index for active statuses
DROP INDEX IF EXISTS job_unique_active_per_channel;
CREATE UNIQUE INDEX IF NOT EXISTS job_unique_active_per_channel
ON "Job" ("channelId", "status")
WHERE "status" IN ('QUEUED','FETCHING','SUMMARIZING','WRITING_SCRIPT','SYNTHESIZING_AUDIO','UPLOADING');


