"use client";

import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Plus, Radio } from "lucide-react";

interface TopBarProps {
  isLoggedIn?: boolean;
  userName?: string;
  userImage?: string;
  onCreateChannel?: () => void;
  onLogin?: () => void;
}

export function TopBar({
  isLoggedIn,
  userName,
  userImage,
  onCreateChannel,
  onLogin,
}: TopBarProps) {

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto w-full max-w-6xl flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Radio className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">AI Podcast</span>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          <SignedIn>
            <UserButton appearance={{ elements: { userButtonAvatarBox: "h-9 w-9" } }} />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline">Log In</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </div>
  );
}

