# Deployment Checklist ✅

This checklist confirms that the Next.js app is ready for GitHub + Vercel deployment.

## ✅ Completed Tasks

### 1. Environment Configuration
- [x] Created `.env.example` with all required environment variables
- [x] Documented all env vars (Database, Clerk, Worker API, AWS S3, optional configs)
- [x] Set production `WORKER_BASE_URL` to `https://newsagent-production-be4a.up.railway.app`
- [x] No hardcoded localhost references in app code

### 2. Gitignore Configuration
- [x] Updated `.gitignore` to exclude `newsagent/` folder (worker is deployed separately)
- [x] Ignoring `.env*` files (except `.env.example`)
- [x] Ignoring `.next/`, `.vercel/`, `node_modules/`, and other build artifacts

### 3. Code Audit
- [x] All API routes use `WORKER_BASE_URL` environment variable
- [x] No localhost:8000 or localhost:3000 hardcoded in source code
- [x] `next.config.ts` contains dev origins only (safe for production)
- [x] Fixed all Next.js 15 async params issues (`params: Promise<{...}>`)
- [x] Fixed all TypeScript linting errors
- [x] Excluded `prisma/seed.ts` from build (outdated schema)

### 4. API Endpoints
- [x] `POST /api/channels/[id]/generate` - proxies to worker
- [x] `GET /api/episodes/[episodeId]/status` - reads from DB (returns `audioKey`)
- [x] `GET /api/episodes/[episodeId]/playback-url` - reads `audioKey` from DB, generates S3 presigned URL
- [x] `GET /api/healthz` - health check for Next.js + worker connectivity

### 5. Documentation
- [x] `README_DEPLOY.md` - comprehensive deployment guide
- [x] `DEPLOYMENT_CHECKLIST.md` - this file
- [x] `.env.example` - environment variable template

### 6. Production Build
- [x] `npm run build` completes successfully
- [x] No critical TypeScript errors
- [x] All routes compile correctly
- [x] Middleware builds successfully (80.4 kB)

## 📋 Pre-Deployment Steps

Before pushing to GitHub and deploying to Vercel:

1. **Review Environment Variables**
   - [ ] Ensure all values in `.env.local` are correct
   - [ ] **Do NOT commit `.env` or `.env.local`**
   - [ ] Only commit `.env.example` (template with placeholders)

2. **Verify Database Access**
   - [ ] Neon database is accessible from Vercel IPs (should be public by default)
   - [ ] `DATABASE_URL` includes `?sslmode=require`

3. **Verify Clerk Configuration**
   - [ ] Clerk publishable and secret keys are from the correct environment (production)
   - [ ] Your Vercel domain will be added to Clerk's authorized domains after first deploy

4. **Verify Worker API**
   - [ ] Worker is running on Railway: `https://newsagent-production-be4a.up.railway.app`
   - [ ] Worker `/healthz` endpoint is accessible
   - [ ] Worker accepts Clerk tokens for authentication

5. **AWS S3 Configuration**
   - [ ] S3 bucket is accessible from Vercel
   - [ ] AWS credentials have `s3:GetObject` permission for presigned URLs
   - [ ] S3 bucket CORS is configured if needed

## 🚀 Deployment to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel auto-detects Next.js

3. **Configure Environment Variables**
   - In Vercel dashboard → **Settings → Environment Variables**
   - Add all variables from `.env.example`:
     - `DATABASE_URL`
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
     - `CLERK_SECRET_KEY`
     - `WORKER_BASE_URL`
     - `AWS_ACCESS_KEY_ID`
     - `AWS_SECRET_ACCESS_KEY`
     - `AWS_REGION`
     - `S3_BUCKET_NAME`
   - Set for **Production**, **Preview**, and **Development** environments

4. **Deploy**
   - Click **"Deploy"** in Vercel
   - Wait for build to complete
   - Vercel will provide a production URL (e.g., `https://your-app.vercel.app`)

5. **Post-Deployment Verification**
   - [ ] Visit your production URL
   - [ ] Test health check: `https://your-app.vercel.app/api/healthz`
   - [ ] Test Clerk login
   - [ ] Create a channel and generate an episode
   - [ ] Verify episode playback works

## 🔑 Key Architecture Notes

### Audio Storage: `audioKey` vs `playbackUrl`

The app uses a secure, on-demand presigning architecture:

- **`audioKey`**: S3 object key stored in the Episode table (e.g., `episodes/abc123.mp3`)
  - Written by the **worker** when episode generation completes
  - Read by Next.js (read-only) to generate presigned URLs
  
- **`playbackUrl`**: Short-lived presigned S3 URL generated on-demand
  - Created by `GET /api/episodes/[episodeId]/playback-url` 
  - Uses AWS SDK v3 to convert `audioKey` → presigned URL
  - Expires after TTL (default: 900 seconds = 15 minutes)
  - Automatically re-presigned when expired or 403 error occurs

**Flow:**
1. Worker generates episode → stores `audioKey` in database
2. Client requests playback → Next.js reads `audioKey` from DB
3. Next.js generates presigned `playbackUrl` using AWS SDK
4. Client plays audio using `playbackUrl`
5. If URL expires → client automatically fetches fresh `playbackUrl`

## 📝 Environment Variables Reference

See `.env.example` for the complete list. Critical variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | Clerk public key |
| `CLERK_SECRET_KEY` | ✅ | Clerk secret key |
| `WORKER_BASE_URL` | ✅ | Railway worker URL |
| `AWS_ACCESS_KEY_ID` | ✅ | AWS credentials for S3 |
| `AWS_SECRET_ACCESS_KEY` | ✅ | AWS credentials for S3 |
| `AWS_REGION` | ✅ | AWS region (e.g., us-east-1) |
| `S3_BUCKET_NAME` | ✅ | S3 bucket for audio files |

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Railway Worker**: https://newsagent-production-be4a.up.railway.app
- **Neon Database**: https://neon.tech/
- **Clerk Dashboard**: https://dashboard.clerk.com/
- **Next.js Deployment Docs**: https://nextjs.org/docs/deployment

## 🎉 Success Criteria

Your deployment is successful if:

- ✅ `/api/healthz` returns `{ "status": "healthy" }`
- ✅ Users can log in via Clerk
- ✅ Channels can be created
- ✅ "Generate" button triggers episode generation
- ✅ Episodes become playable after ~2-3 minutes
- ✅ Audio playback works with automatic URL re-presigning

---

**Ready to deploy? Follow the steps above and you're good to go! 🚀**

