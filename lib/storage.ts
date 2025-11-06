import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const REQUIRED_ENVS = [
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_REGION",
  "S3_BUCKET_NAME",
];

function assertEnv() {
  const missing = REQUIRED_ENVS.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing required envs: ${missing.join(", ")}`);
  }
}

function getS3(): S3Client {
  assertEnv();
  return new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

function getSize(data: unknown): number | undefined {
  if (!data) return undefined;
  // Buffer | Uint8Array
  // @ts-expect-error best-effort
  if (typeof data.byteLength === "number") return data.byteLength as number;
  // Blob
  // @ts-expect-error best-effort
  if (typeof data.size === "number") return data.size as number;
  return undefined;
}

// Worker-owned responsibility: audio generation and S3 uploads happen in the worker.
// This helper is intentionally disabled to prevent usage from Next.js code paths.
export async function uploadEpisodeAudio(): Promise<never> {
  throw new Error("Not Implemented: Worker-owned responsibility (audio upload)");
}

export async function getPlaybackUrl(playbackUrl: string): Promise<string> {
  // If already an https URL (e.g., public bucket/CDN), return as-is
  if (/^https?:\/\//i.test(playbackUrl)) return playbackUrl;

  // Expect s3://bucket/key
  if (playbackUrl.startsWith("s3://")) {
    const without = playbackUrl.slice("s3://".length);
    const firstSlash = without.indexOf("/");
    if (firstSlash === -1) throw new Error("Invalid s3 URL format");
    const bucket = without.slice(0, firstSlash);
    const key = without.slice(firstSlash + 1);

    const s3 = getS3();
    const expires = Number(process.env.S3_SIGNED_URL_TTL_SECONDS ?? 900);
    const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
    return await getSignedUrl(s3, cmd, { expiresIn: expires });
  }

  // Unknown scheme; return as-is
  return playbackUrl;
}


