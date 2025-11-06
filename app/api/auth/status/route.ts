import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId, sessionId } = await auth();
  return NextResponse.json({
    userId: userId ?? null,
    sessionId: sessionId ?? null,
    isServerSignedIn: Boolean(userId),
  });
}


