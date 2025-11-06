import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ episodeId: string }> }) {
  const { episodeId } = await params;
  if (!episodeId) {
    return NextResponse.json({ error: "episodeId is required" }, { status: 400 });
  }

  try {
    const ep = await prisma.episode.findUnique({
      where: { id: episodeId },
      select: {
        status: true,
        error: true,
        script: true,
        audioKey: true,
        durationSec: true,
      },
    });
    if (!ep) return NextResponse.json({ error: "Episode not found" }, { status: 404 });

    return NextResponse.json({
      status: ep.status,
      error: ep.error ?? null,
      script: ep.script ?? null,
      audioKey: ep.audioKey ?? null,
      durationSec: ep.durationSec ?? null,
    });
  } catch (e) {
    const error = e as Error;
    return NextResponse.json({ error: error?.message ?? "Unexpected error" }, { status: 500 });
  }
}


