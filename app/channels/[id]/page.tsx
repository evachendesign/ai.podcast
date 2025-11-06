export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/dashboard/top-bar";
import Link from "next/link";
import { ChannelGenerateSection } from "@/components/channel/channel-generate-section";
import { EpisodeList } from "@/components/channel/episode-list";
import { notFound } from "next/navigation";

export default async function ChannelByIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || typeof id !== "string") {
    notFound();
  }

  const channel = await prisma.channel.findUnique({
    where: { id },
    include: {
      user: true,
      episodes: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          createdAt: true,
          audioKey: true,
        },
      },
    },
  });

  if (!channel) {
    return <div className="mx-auto w-full max-w-6xl p-6">Channel not found.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="mx-auto w-full max-w-6xl px-4 md:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Channel: {channel.name}</h1>
          <Link href="/" className="text-sm text-muted-foreground hover:underline">Close</Link>
        </div>
        <div className="space-y-2 text-sm">
          {channel.topic && (
            <p className="text-muted-foreground"><span className="font-medium text-foreground">Topic:</span> {channel.topic}</p>
          )}
          {channel.news_url && (
            <p className="text-muted-foreground"><span className="font-medium text-foreground">News URL:</span> {channel.news_url}</p>
          )}
        </div>

        <ChannelGenerateSection channelId={channel.id} />

        <EpisodeList
          initialEpisodes={channel.episodes.map((e) => ({
            id: e.id,
            status: e.status,
            createdAt: e.createdAt?.toISOString?.() ?? null,
            audioKey: e.audioKey ?? null,
          }))}
        />

        
      </main>
    </div>
  );
}


