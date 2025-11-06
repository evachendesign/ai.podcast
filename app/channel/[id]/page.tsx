import { redirect } from "next/navigation";

export default async function ChannelIdAlias({ params }: { params: Promise<{ id: string }> }) {
  // Alias /channel/[id] -> /channels/[id]
  const { id } = await params;
  redirect(`/channels/${id}`);
}


