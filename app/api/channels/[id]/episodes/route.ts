import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const episodes = await prisma.episode.findMany({
    where: { channelId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ episodes });
}

// Worker-owned responsibility: creating/updating Episode rows is handled by the worker.
// This endpoint is intentionally disabled to enforce read-only from Next.js.
export async function POST() {
  return NextResponse.json({ error: "Not Implemented: Worker-owned responsibility" }, { status: 501 });
}


