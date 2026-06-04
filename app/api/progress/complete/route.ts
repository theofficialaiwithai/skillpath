import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq, count, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { userProgress, userPaths, pathSteps, userProfiles } from "@/db/schema";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { pathStepId, userPathId } = await req.json();
  if (!pathStepId || !userPathId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // 1. Record this step as complete
  await db
    .insert(userProgress)
    .values({ clerkUserId: userId, userPathId, pathStepId, completedAt: new Date() })
    .onConflictDoNothing();

  // 2. Look up the parent path so we can count total vs completed steps
  const [userPath] = await db
    .select({ pathId: userPaths.pathId })
    .from(userPaths)
    .where(eq(userPaths.id, userPathId));

  if (!userPath) return NextResponse.json({ success: true, pathCompleted: false });

  // 3. Total steps in this path
  const [{ total }] = await db
    .select({ total: count(pathSteps.id) })
    .from(pathSteps)
    .where(eq(pathSteps.pathId, userPath.pathId));

  // 4. Steps the user has completed so far
  const [{ done }] = await db
    .select({ done: count(userProgress.id) })
    .from(userProgress)
    .where(eq(userProgress.userPathId, userPathId));

  const pathCompleted = Number(done) >= Number(total) && Number(total) > 0;

  if (pathCompleted) {
    // 5a. Mark the path as completed
    await db
      .update(userPaths)
      .set({ isCompleted: true, completedAt: new Date() })
      .where(eq(userPaths.id, userPathId));

    // 5b. Increment the user's completed-paths counter
    await db
      .update(userProfiles)
      .set({ completedPathsCount: sql`${userProfiles.completedPathsCount} + 1` })
      .where(eq(userProfiles.clerkUserId, userId));
  }

  return NextResponse.json({ success: true, pathCompleted, pathId: userPath.pathId });
}
