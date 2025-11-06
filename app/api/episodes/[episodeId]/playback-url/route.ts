import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ episodeId: string }> }) {
  const { episodeId } = await params;
  if (!episodeId) {
    return NextResponse.json({ error: "episodeId is required" }, { status: 400 });
  }

  // Validate AWS env
  const region = process.env.AWS_REGION?.trim();
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();
  // Support both S3_BUCKET_NAME and S3_BUCKET
  const bucket = (process.env.S3_BUCKET_NAME || process.env.S3_BUCKET)?.trim();
  if (!region || !accessKeyId || !secretAccessKey || !bucket) {
    return NextResponse.json({ error: "Server misconfiguration: AWS env vars are missing" }, { status: 500 });
  }

  try {
    // Read episode from our DB (read-only)
    const ep = await prisma.episode.findUnique({ where: { id: episodeId }, select: { audioKey: true } });
    if (!ep) return NextResponse.json({ error: "Episode not found" }, { status: 404 });
    const audioKey = ep.audioKey?.trim();
    if (!audioKey) return NextResponse.json({ error: "Episode not ready (no audioKey)" }, { status: 409 });

    const expires = Number(process.env.S3_SIGNED_URL_TTL_SECONDS ?? 900);
    const s3 = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
    // Debug logging: presign request context
    try {
      console.log(
        JSON.stringify({
          level: "info",
          msg: "episode_playback_presign_request",
          episodeId,
          audioKey,
          bucket,
          region,
          ttlSeconds: expires,
        })
      );
    } catch {}
    const cmd = new GetObjectCommand({ Bucket: bucket, Key: audioKey });
    const playbackUrl = await getSignedUrl(s3, cmd, { expiresIn: expires });
    const expiresAt = new Date(Date.now() + expires * 1000).toISOString();
    // Debug logging: presign issued (only prefix of URL)
    try {
      console.log(
        JSON.stringify({
          level: "info",
          msg: "episode_playback_presign_issued",
          episodeId,
          urlPrefix: String(playbackUrl).slice(0, 60),
        })
      );
    } catch {}
    return NextResponse.json({ playbackUrl, expiresAt });
  } catch (e) {
    const error = e as Error;
    return NextResponse.json({ error: error?.message ?? "Unexpected error" }, { status: 500 });
  }
}


