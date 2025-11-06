# Deployment Guide: AI Podcast (Next.js Frontend)

This document describes how to deploy the **AI Podcast** Next.js frontend to **Vercel**.

The backend worker (located in the `newsagent/` folder) is deployed separately on **Railway** at:
```
https://newsagent-production-be4a.up.railway.app
```

---

## Prerequisites

1. **GitHub Account** – Your code should be pushed to a GitHub repository
2. **Vercel Account** – Sign up at [vercel.com](https://vercel.com)
3. **Neon Database** – PostgreSQL database (already provisioned)
4. **Clerk Account** – Authentication provider (already configured)
5. **AWS S3 Bucket** – For audio file storage (already configured)

---

## Required Environment Variables

You must configure the following environment variables in Vercel's project settings:

### Database
- `DATABASE_URL` – PostgreSQL connection string from Neon (includes `?sslmode=require`)

### Authentication (Clerk)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` – Clerk publishable key (starts with `pk_`)
- `CLERK_SECRET_KEY` – Clerk secret key (starts with `sk_`)
- `CLERK_DOMAIN` _(optional)_ – Custom Clerk domain if applicable

### Worker API (Railway Backend)
- `WORKER_BASE_URL` – **REQUIRED**  
  Production: `https://newsagent-production-be4a.up.railway.app`  
  Development: `http://localhost:8000`

### AWS S3 (Audio Storage)
- `AWS_ACCESS_KEY_ID` – AWS access key
- `AWS_SECRET_ACCESS_KEY` – AWS secret access key
- `AWS_REGION` – AWS region (e.g., `us-east-1`)
- `S3_BUCKET_NAME` – S3 bucket name for audio files

### Optional
- `S3_PUBLIC_BASE_URL` – CloudFront or custom CDN URL (if using)
- `S3_SIGNED_URL_TTL_SECONDS` – Presigned URL TTL (default: `3600` = 1 hour)
- `INTERNAL_SHARED_SECRET` – Shared secret for Next.js ↔ Worker authentication (if implemented)

---

## Deployment Steps to Vercel

### 1. Push Your Code to GitHub

Ensure your local changes are committed and pushed:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Import Project to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your GitHub repository
4. Vercel will auto-detect Next.js

### 3. Configure Environment Variables

In the Vercel project settings:

1. Go to **Settings → Environment Variables**
2. Add all variables from the list above
3. Set them for **Production**, **Preview**, and **Development** environments as needed

**Tip:** You can bulk-import from your `.env.local` file (copy/paste key=value pairs).

### 4. Configure Build Settings (if needed)

Vercel automatically detects Next.js projects. Default settings should work:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`

If you have a custom build command, update it in **Settings → General → Build & Development Settings**.

### 5. Deploy

Click **"Deploy"** in Vercel. Vercel will:

1. Install dependencies (`npm install`)
2. Run Prisma generate (if configured in `package.json`)
3. Build the Next.js app (`npm run build`)
4. Deploy to a production URL

### 6. Verify Deployment

After deployment completes:

1. Visit your Vercel production URL (e.g., `https://your-app.vercel.app`)
2. Check the health endpoint: `https://your-app.vercel.app/api/healthz`
   - Should return `{ "status": "healthy", ... }` if the backend is reachable
3. Test authentication (Clerk login)
4. Create a channel and generate an episode

---

## Continuous Deployment

Vercel automatically redeploys your app when you push to your GitHub repository:

- **Push to `main`** → Production deployment
- **Push to other branches** → Preview deployment

You can configure branch deployment settings in **Settings → Git**.

---

## Database Migrations

If you update the Prisma schema:

1. Run migrations locally:
   ```bash
   npm run prisma:migrate
   ```

2. Commit the new migration files in `prisma/migrations/`

3. Push to GitHub

4. Vercel will automatically run `prisma generate` during build

**Note:** Prisma migrations run manually. If you need to apply migrations to production, either:
- Use Neon's SQL editor to apply the migration SQL
- Run `npx prisma db push` from your local machine (connected to production DB)
- Set up a post-deploy hook in Vercel (advanced)

---

## Worker Backend (Railway)

The backend worker handles:
- Episode generation (AI agents, news scraping, TTS)
- Job queue management
- Database writes for `Job` and `Episode` tables
- Authentication gating

**Backend URL:**  
`https://newsagent-production-be4a.up.railway.app`

The Next.js app **only reads** from the database and **proxies requests** to the worker for:
- `POST /jobs/run-from-channel` (trigger episode generation)
- `GET /episodes/{id}/status` (check episode status)

**Important:** The `newsagent/` folder is **excluded** from the Vercel deployment (see `.gitignore`). The worker is deployed separately on Railway.

---

## Troubleshooting

### Build fails on Vercel
- Check **Build Logs** in Vercel dashboard
- Ensure all required environment variables are set
- Verify `DATABASE_URL` is accessible from Vercel (Neon should allow connections from anywhere by default)

### "WORKER_BASE_URL is not set" error
- Add `WORKER_BASE_URL=https://newsagent-production-be4a.up.railway.app` to Vercel environment variables
- Redeploy

### Health check fails (`/api/healthz` returns unhealthy)
- Verify the worker is running on Railway
- Check Railway logs for errors
- Test the worker directly: `curl https://newsagent-production-be4a.up.railway.app/healthz`

### Clerk authentication issues
- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are correct
- Check Clerk dashboard → **API Keys** for the correct environment (development vs. production)
- Ensure your Vercel domain is added to Clerk's **Authorized Domains**

### Database connection issues
- Ensure `DATABASE_URL` includes `?sslmode=require` for Neon
- Check Neon dashboard for connection limits or IP restrictions
- Test connection locally with `npx prisma db pull`

---

## Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Clerk Deployment Guide](https://clerk.com/docs/deployments/overview)

---

## Support

For issues or questions:
1. Check the health endpoint: `/api/healthz`
2. Review Vercel build logs
3. Check Railway logs for the worker
4. Verify environment variables are set correctly

---

**Happy Deploying! 🚀**

