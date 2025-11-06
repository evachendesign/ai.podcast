# Worker Integration Contract v1 (Source of Truth for Next.js)

Last updated: 2025-11-04

This document defines how the Next.js app integrates with the worker (newsagent) API.

## Endpoints

- Trigger job (create or reuse)
  - POST {WORKER_BASE_URL}/jobs/run-from-channel
  - Request:
    ```json
    { "channel_id": "<uuid>" }
    ```
  - Response:
    ```json
    { "jobId": "...", "episodeId": "...", "status": "QUEUED" | "RUNNING" | "COMPLETE" | "FAILED" }
    ```
  - Notes:
    - Dedupe is worker-owned: if a job is active for the channel, returns the existing job/episode.

- Episode status (poll this only)
  - GET {WORKER_BASE_URL}/episodes/{episodeId}/status
  - Response:
    ```json
    {
      "status": "QUEUED" | "PROCESSING" | "READY" | "FAILED",
      "error": "string or null",
      "script": "string or null",
      "audioKey": "string or null",
      "durationSec": 0
    }
    ```
  - Notes:
    - Worker never returns presigned URLs; only the immutable `audioKey` when READY.

## Example curl

- Trigger
```bash
curl -X POST "$WORKER_BASE_URL/jobs/run-from-channel" \
  -H "Authorization: Bearer $CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channel_id":"<CHANNEL_ID>"}'
```

- Poll episode
```bash
curl "$WORKER_BASE_URL/episodes/<EPISODE_ID>/status" \
  -H "Authorization: Bearer $CLERK_TOKEN"
```

## Sequence (ASCII)

```
User clicks Generate
     ↓
Next.js POST /api/channels/:id/generate
     ↓
Worker POST /jobs/run-from-channel  → returns { jobId, episodeId, status }
     ↓
Next.js polls GET /episodes/{episodeId}/status until READY/FAILED
     ↓
Next.js presigns audioKey → short-lived playbackUrl
     ↓
Browser plays audio
```

## What Next.js must NOT do

- Do not implement dedupe (worker owns it).
- Do not gate worker endpoints with extra auth; rely on Clerk token.
- Do not write Job/Episode rows directly (read-only from Next.js).
- Do not presign on the worker; only Next.js presigns.

## Terminology alignment

- Job status: worker uses `COMPLETE` (not `SUCCEEDED`).
- Episode status: worker uses `PROCESSING` (not `RUNNING`).

If future changes are desired, prefer a doc update first. Only if strictly necessary, propose a tiny worker PR to rename fields consistently across API and DB enums.


