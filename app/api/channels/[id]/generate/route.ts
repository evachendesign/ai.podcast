import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const channel = await prisma.channel.findUnique({ where: { id } });
  if (!channel) return NextResponse.json({ error: "Channel not found" }, { status: 404 });

  const baseUrl = process.env.WORKER_BASE_URL?.trim();
  if (!baseUrl) {
    return NextResponse.json({ error: "Server misconfiguration: WORKER_BASE_URL is not set" }, { status: 500 });
  }

  try {
    const { getToken } = await auth();
    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const resp = await fetch(`${baseUrl.replace(/\/$/, "")}/jobs/run-from-channel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ channel_id: id }),
    });

    const text = await resp.text();
    if (!resp.ok) {
      // Bubble up worker error details when available
      return NextResponse.json({ error: `Worker error ${resp.status}: ${text}` }, { status: 502 });
    }

    // Return worker response as-is
    const data = safeJsonParse(text);
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    const error = e as Error;
    return NextResponse.json({ error: error?.message ?? "Unexpected error" }, { status: 500 });
  }
}

function safeJsonParse(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch {
    return { raw: input };
  }
}


