import { TopBar } from "@/components/dashboard/top-bar";
import { CreateChannelForm } from "@/components/create/create-channel-form";

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="mx-auto w-full max-w-2xl px-4 md:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Create a new channel</h1>
          <p className="text-muted-foreground">Define your channel details below</p>
        </div>
        <CreateChannelForm />
      </main>
    </div>
  );
}


