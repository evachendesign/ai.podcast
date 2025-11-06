# Ownership & Responsibilities

This Next.js app focuses on UI, proxying, read-only DB access for Channels, and presigning S3 URLs for playback.

## Worker (newsagent) owns
- Auth gate on its APIs (via Clerk token)
- Dedupe and one-active-job-per-channel rule
- Job/Episode writes (create/update)
- Audio generation and S3 uploads
- Storing immutable `audioKey` (never presigns)

## Next.js owns
- Trigger worker (proxy) and poll episode status
- Read-only access for Channels (and reading Episodes if needed)
- S3 presign from `audioKey` to short-lived `playbackUrl`
- UI rendering

## Worker Endpoints
- POST `${WORKER_BASE_URL}/jobs/run-from-channel`
  - Body: `{ "channel_id": "<uuid>" }`
  - Response: `{ jobId, episodeId, status }` (status is `QUEUED|RUNNING|COMPLETE|FAILED`)
  - Dedupe is worker-owned (may return existing active job)
- GET `${WORKER_BASE_URL}/episodes/{episodeId}/status`
  - Response: `{ status, error, script, audioKey, durationSec }`
  - Worker never presigns; returns `audioKey` when READY

Set `WORKER_BASE_URL` in your environment for proxying.

## Prohibited in Next.js
- Writing Job or Episode rows (disabled)
- Dedupe logic for jobs
- Auth gating for worker logic (use Clerk token to call worker)
- Presigning in the worker (only Next.js presigns)

See also: `docs/integration/contract-v1.md` and `docs/checklist-contract-sync.md`.


