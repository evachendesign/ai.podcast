import { prisma } from "@/lib/prisma";

async function main() {
  const channel = await prisma.channel.upsert({
    where: { name: "AI Daily" },
    update: {},
    create: {
      name: "AI Daily",
      description: "Daily 5-minute AI news recap",
      crawlUrls: ["https://news.ycombinator.com/rss", "https://www.theverge.com/ai/rss/index.xml"],
    },
  });

  await prisma.episode.create({
    data: {
      channelId: channel.id,
      title: "Welcome to AI Daily",
      description: "Intro episode",
      audioUrl: null,
      durationSec: null,
      publishedAt: null,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });


