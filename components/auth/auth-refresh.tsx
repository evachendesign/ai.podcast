"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function AuthRefresh() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const prev = useRef<boolean | null>(null);

  useEffect(() => {
    if (prev.current === null) {
      prev.current = isSignedIn ?? false;
      return;
    }
    if (prev.current !== isSignedIn) {
      prev.current = isSignedIn ?? false;
      // Delay slightly to reduce flicker and allow server session to commit
      const t = setTimeout(() => router.replace("/"), 250);
      return () => clearTimeout(t);
    }
  }, [isSignedIn, router]);

  return null;
}


