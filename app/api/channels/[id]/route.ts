import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const channel = await prisma.channel.findUnique({
    where: { id },
    include: { episodes: { orderBy: { createdAt: "desc" } } },
  });
  if (!channel) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ channel });
}


