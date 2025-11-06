# Environment Variables Reference

This document lists all environment variables used by the AI Podcast Next.js application, organized by category.

## ✅ Required Variables

### Database
| Variable | Example | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://user:pass@host.neon.tech/db?sslmode=require` | Neon PostgreSQL connection string (required) |

### Authentication (Clerk)
| Variable | Example | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_...` | Clerk publishable key (public, starts with `pk_`) |
| `CLERK_SECRET_KEY` | `sk_test_...` | Clerk secret key (private, starts with `sk_`) |

### Worker API (Railway Backend)
| Variable | Example | Description |
|----------|---------|-------------|
| `WORKER_BASE_URL` | `https://newsagent-production-be4a.up.railway.app` | Base URL for the worker API (required) |

### AWS S3 (Audio Storage)
| Variable | Example | Description |
|----------|---------|-------------|
| `AWS_ACCESS_KEY_ID` | `AKIA...` | AWS access key ID |
| `AWS_SECRET_ACCESS_KEY` | `wJa...` | AWS secret access key |
| `AWS_REGION` | `us-east-1` | AWS region where S3 bucket is located |
| `S3_BUCKET_NAME` | `ai-podcast-audio` | S3 bucket name for audio files |

> **Note**: The app also supports `S3_BUCKET` for backward compatibility, but `S3_BUCKET_NAME` is preferred.

## 🔧 Optional Variables

### Clerk (Optional)
| Variable | Example | Description |
|----------|---------|-------------|
| `CLERK_DOMAIN` | `your-app.clerk.accounts.dev` | Custom Clerk domain (only if using custom domain) |

### S3 Configuration (Optional)
| Variable | Example | Description |
|----------|---------|-------------|
| `S3_PUBLIC_BASE_URL` | `https://d123.cloudfront.net` | CloudFront or custom CDN URL (if using) |
| `S3_SIGNED_URL_TTL_SECONDS` | `900` | Presigned URL expiry time in seconds (default: 900 = 15 min) |

### AI/Tools (Optional)
| Variable | Example | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | `sk-...` | OpenAI API key (typically only needed by worker) |
| `SERPER_API_KEY` | `...` | Serper API key for search (typically only needed by worker) |

### Integrations (Optional)
| Variable | Example | Description |
|----------|---------|-------------|
| `DISCORD_WEBHOOK_URL` | `https://discord.com/api/webhooks/...` | Discord webhook for notifications |
| `TTS_VOICE` | `alloy` | Text-to-speech voice selection |
| `TTS_STYLE_CUES` | `true` | Enable TTS style cues |

### Server (Optional)
| Variable | Example | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port (default: 3000) |

## 🔐 Security Notes

### Public vs Private Variables

**Public variables** (prefixed with `NEXT_PUBLIC_`):
- Exposed to the browser
- Safe for client-side code
- Example: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

**Private variables** (no prefix):
- Only available server-side
- Never exposed to the browser
- Examples: `CLERK_SECRET_KEY`, `AWS_SECRET_ACCESS_KEY`, `WORKER_BASE_URL`

### Never Commit Secrets

- ❌ **Never commit** `.env` or `.env.local` files
- ✅ **Always commit** `.env.example` (with placeholder values)
- ✅ Store production secrets in Vercel environment variables

## 📊 Variable Usage by Component

### API Routes
| Route | Variables Used |
|-------|---------------|
| `/api/channels/[id]/generate` | `WORKER_BASE_URL`, `CLERK_SECRET_KEY` |
| `/api/episodes/[episodeId]/status` | `DATABASE_URL` (via Prisma) |
| `/api/episodes/[episodeId]/playback-url` | `DATABASE_URL`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME` |
| `/api/healthz` | `WORKER_BASE_URL` |

### Key Data Flow: audioKey → playbackUrl

1. **Worker writes** `audioKey` to Episode table (e.g., `"episodes/abc123.mp3"`)
2. **Next.js reads** `audioKey` from database (server-side)
3. **Next.js generates** presigned `playbackUrl` using AWS SDK v3:
   ```typescript
   const s3 = new S3Client({
     region: process.env.AWS_REGION,
     credentials: {
       accessKeyId: process.env.AWS_ACCESS_KEY_ID,
       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
     },
   });
   const cmd = new GetObjectCommand({ 
     Bucket: process.env.S3_BUCKET_NAME, 
     Key: audioKey // from database
   });
   const playbackUrl = await getSignedUrl(s3, cmd, { 
     expiresIn: Number(process.env.S3_SIGNED_URL_TTL_SECONDS ?? 900)
   });
   ```
4. **Client receives** `playbackUrl` (temporary presigned URL)
5. **Audio plays** from presigned URL
6. **URL expires** → client automatically requests new presigned URL

## 🚀 Vercel Deployment

When deploying to Vercel, add these variables in:
**Dashboard → Project → Settings → Environment Variables**

### Minimum Required for Production:
```bash
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
WORKER_BASE_URL=https://newsagent-production-be4a.up.railway.app
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
```

## 🧪 Development vs Production

### Development (`.env.local`)
- `WORKER_BASE_URL=http://localhost:8000` (local worker)
- Clerk test keys (`pk_test_...`, `sk_test_...`)
- Development database URL

### Production (Vercel)
- `WORKER_BASE_URL=https://newsagent-production-be4a.up.railway.app` (Railway)
- Clerk production keys (`pk_live_...`, `sk_live_...`)
- Production database URL (Neon)

## ✅ Verification Checklist

Before deploying, verify:

- [ ] All required variables are set in Vercel
- [ ] `WORKER_BASE_URL` points to Railway production URL
- [ ] Clerk keys are from the **production** environment
- [ ] `DATABASE_URL` is from Neon production database
- [ ] AWS credentials have S3 read access (`s3:GetObject`)
- [ ] `S3_BUCKET_NAME` matches the actual bucket name
- [ ] No hardcoded secrets in code (use env vars)

## 📚 Related Documentation

- [README_DEPLOY.md](./README_DEPLOY.md) - Full deployment guide
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Pre-deployment checklist
- [.env.example](./.env.example) - Environment variable template

---

**Need help?** Check `/api/healthz` to verify backend connectivity and environment configuration.

