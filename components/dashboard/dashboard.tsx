"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { TopBar } from "./top-bar";
import { EmptyState } from "./empty-state";
import { ChannelGrid, Channel } from "./channel-grid";

interface DashboardProps {
  initialChannels?: Channel[];
  isLoggedIn?: boolean;
  userName?: string;
  userImage?: string;
}

export function Dashboard({
  initialChannels = [],
  isLoggedIn = false,
  userName,
  userImage,
}: DashboardProps) {
  // Derive directly from props so router.refresh() immediately reflects server data
  const channels: Channel[] = initialChannels;
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const authMismatched = isLoaded && (Boolean(isSignedIn) !== Boolean(isLoggedIn));
  // Only show loading while Clerk is initializing; do not block on mismatch
  const showLoading = !isLoaded;
  const [showDelayed, setShowDelayed] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (showLoading) {
      timer = setTimeout(() => setShowDelayed(true), 1000);
    } else {
      setShowDelayed(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showLoading]);

  // If client/server auth disagree after load, trigger a refresh to reconcile
  useEffect(() => {
    if (authMismatched) {
      router.refresh();
    }
  }, [authMismatched, router]);

  const handleCreateChannel = () => {
    router.push("/create");
  };

  const handleLogin = () => {
    console.log("Login");
    // TODO: Implement login
  };

  const handleGoToChannel = (id: string) => {
    console.log("Go to channel:", id);
    // TODO: Implement navigation
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar
        isLoggedIn={isLoggedIn}
        userName={userName}
        userImage={userImage}
        onCreateChannel={handleCreateChannel}
        onLogin={handleLogin}
      />
      <main className="relative">
        {channels.length === 0 ? (
          <EmptyState onCreateChannel={handleCreateChannel} />
        ) : (
          <ChannelGrid
            channels={channels}
            onGoToChannel={handleGoToChannel}
            onCreateChannel={handleCreateChannel}
          />
        )}

        {showLoading && showDelayed && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/40 border-t-primary animate-spin" />
              <span>Updating your dashboard…</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

