# Contract Sync Checklist

Run this checklist whenever either repo changes worker API behavior or docs.

- [ ] Verify worker enums match docs
  - Job: `QUEUED`, `RUNNING`, `COMPLETE`, `FAILED`
  - Episode: `QUEUED`, `PROCESSING`, `READY`, `FAILED`
- [ ] Confirm `POST /jobs/run-from-channel` returns `{ jobId, episodeId, status }`
- [ ] Confirm `GET /episodes/{episodeId}/status` returns `{ status, error, script, audioKey, durationSec }`
- [ ] Ensure worker never returns presigned URLs (only `audioKey`)
- [ ] Mark `GET /jobs/{jobId}` as deprecated for Next.js flow in worker docs
- [ ] Next.js docs updated: `docs/integration/contract-v1.md`
- [ ] Example curls verified against local/dev worker
- [ ] Sequence diagram matches current flow
- [ ] “What Next.js must NOT do” box present and correct
- [ ] If any mismatch is found, open doc-only fix first
- [ ] If API change is required, propose minimal worker PR with clear before/after


