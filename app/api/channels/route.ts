import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

export async function GET() {
  const { userId } = await auth();
  const cookieStore = await cookies();
  let dbUserId: string | null = null;
  if (userId) {
    const user = await prisma.user.upsert({
      where: { clerkUserId: userId },
      update: { isGuest: false },
      create: { clerkUserId: userId, isGuest: false },
    });
    dbUserId = user.id;

    // If there are channels created as a guest, reassign them to the signed-in user
    const guestId = cookieStore.get("guestUserId")?.value;
    if (guestId && guestId !== dbUserId) {
      await prisma.channel.updateMany({ where: { userId: guestId }, data: { userId: dbUserId } });
      // Clear guest cookie now that channels are merged
      try {
        cookieStore.delete("guestUserId");
      } catch {}
    }
  } else {
    const guestId = cookieStore.get("guestUserId")?.value;
    if (guestId) dbUserId = guestId;
  }

  const channels = await prisma.channel.findMany({
    where: dbUserId ? { userId: dbUserId } : { id: { in: [] } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ channels });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name: unknown = body?.name;
    const topic: unknown = body?.topic;
    const news_url: unknown = body?.news_url;

    if (typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    // Resolve or create a user (Clerk or guest)
    const { userId: clerkUserId } = await auth();
    let dbUserId: string;
    if (clerkUserId) {
      const user = await prisma.user.upsert({
        where: { clerkUserId },
        update: { isGuest: false },
        create: { clerkUserId, isGuest: false },
      });
      dbUserId = user.id;
    } else {
      // guest: create (or reuse via cookie) and set cookie for 24h
      const cookieStore = await cookies();
      const existing = cookieStore.get("guestUserId")?.value;
      if (existing) {
        dbUserId = existing;
      } else {
        const guest = await prisma.user.create({ data: { isGuest: true } });
        dbUserId = guest.id;
        const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        cookieStore.set("guestUserId", guest.id, { expires: expiry, httpOnly: true, sameSite: "lax" });
      }
    }

    const created = await prisma.channel.create({
      data: {
        userId: dbUserId,
        name: name.trim(),
        topic: typeof topic === "string" ? topic : "",
        news_url: typeof news_url === "string" ? news_url : "",
      },
    });

    return NextResponse.json(
      { channel: { id: created.id, name: created.name, topic: created.topic, news_url: created.news_url } },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
}


