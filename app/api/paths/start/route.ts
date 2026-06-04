import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { userPaths } from "@/db/schema";
import { FREE_PATH_LIMIT, getUserPathCount, isSubscribed } from "@/lib/subscription";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { pathId } = await req.json();
  if (!pathId) {
    return NextResponse.json({ error: "Missing pathId" }, { status: 400 });
  }

  // ── Free-tier path limit check ─────────────────────────────────────────────
  const [activeCount, subscribed] = await Promise.all([
    getUserPathCount(userId),
    isSubscribed(userId),
  ]);

  if (!subscribed && activeCount >= FREE_PATH_LIMIT) {
    return NextResponse.json(
      { success: false, reason: "path_limit" },
      { status: 403 }
    );
  }

  await db
    .insert(userPaths)
    .values({ clerkUserId: userId, pathId, hoursPerWeek: 5 })
    .onConflictDoNothing();

  return NextResponse.json({ success: true });
}
