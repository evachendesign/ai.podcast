export const dynamic = "force-dynamic";
export const revalidate = 0;
import { Dashboard } from "@/components/dashboard";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

/**
 * AI Podcast - Landing Page (Channel Dashboard)
 * 
 * This is the main landing page showing the user's podcast channel dashboard.
 * Toggle between different demo scenarios by uncommenting the appropriate return statement.
 * 
 * Demo Scenarios:
 * 1. Empty state - No channels, user not logged in
 * 2. Empty state - No channels, user logged in
 * 3. With channels - User not logged in
 * 4. With channels - User logged in (initials)
 * 5. With channels - User logged in (with Google profile picture)
 */

export default async function Home() {
  const { userId } = await auth();

  // Resolve DB user id: Clerk user -> prisma.user; otherwise guest cookie
  let dbUserId: string | null = null;
  if (userId) {
    const user = await prisma.user.upsert({
      where: { clerkUserId: userId },
      update: { isGuest: false },
      create: { clerkUserId: userId, isGuest: false },
    });
    dbUserId = user.id;
    // If user previously created channels as a guest, reassign them now
    const cookieStore2 = await cookies();
    const guestId = cookieStore2.get("guestUserId")?.value;
    if (guestId && guestId !== dbUserId) {
      await prisma.channel.updateMany({ where: { userId: guestId }, data: { userId: dbUserId } });
      // We do not clear the cookie here (server component); API will clear it on next call
    }
  } else {
    const cookieStore = await cookies();
    const guestId = cookieStore.get("guestUserId")?.value;
    if (guestId) dbUserId = guestId;
  }

  const rows = await prisma.channel.findMany({
    where: dbUserId ? { userId: dbUserId } : { id: { in: [] } },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { episodes: true } } },
  });

  const channels = rows.map((c) => ({
    id: c.id,
    name: c.name.trim(),
    description: (c.topic || c.news_url || "").toString(),
    episodeCount: c._count.episodes,
  }));

  return <Dashboard initialChannels={channels} isLoggedIn={Boolean(userId)} />;
}
