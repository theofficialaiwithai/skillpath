import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, count, eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { pathSteps, userPaths, userProgress, userProfiles } from "@/db/schema";

// Called by YouTubePlayer when a video ends (auto-complete).
// Accepts { stepId, pathId } and resolves userPathId internally.
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { stepId?: string; pathId?: string };
  const { stepId, pathId } = body;
  if (!stepId || !pathId) {
    return NextResponse.json({ error: "Missing stepId or pathId" }, { status: 400 });
  }

  // Resolve the user's path record
  const [userPath] = await db
    .select()
    .from(userPaths)
    .where(and(eq(userPaths.clerkUserId, userId), eq(userPaths.pathId, pathId)));

  if (!userPath) {
    return NextResponse.json({ error: "Path not started" }, { status: 404 });
  }

  // Insert progress (idempotent)
  await db
    .insert(userProgress)
    .values({ clerkUserId: userId, userPathId: userPath.id, pathStepId: stepId, completedAt: new Date() })
    .onConflictDoNothing();

  // Check if path is now fully complete
  const [{ total }] = await db
    .select({ total: count(pathSteps.id) })
    .from(pathSteps)
    .where(eq(pathSteps.pathId, pathId));

  const [{ done }] = await db
    .select({ done: count(userProgress.id) })
    .from(userProgress)
    .where(eq(userProgress.userPathId, userPath.id));

  const pathCompleted = Number(done) >= Number(total) && Number(total) > 0;

  if (pathCompleted) {
    await db
      .update(userPaths)
      .set({ isCompleted: true, completedAt: new Date() })
      .where(eq(userPaths.id, userPath.id));

    await db
      .update(userProfiles)
      .set({ completedPathsCount: sql`${userProfiles.completedPathsCount} + 1` })
      .where(eq(userProfiles.clerkUserId, userId));
  }

  return NextResponse.json({ success: true, pathCompleted });
}
