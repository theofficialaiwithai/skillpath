import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { userProgress, userPaths, pathSteps } from "@/db/schema";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { pathStepId, userPathId } = await req.json();
  if (!pathStepId || !userPathId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await db
    .insert(userProgress)
    .values({ clerkUserId: userId, userPathId, pathStepId, completedAt: new Date() })
    .onConflictDoNothing();

  // Check if all steps for this path are now complete
  const [userPath] = await db.select({ pathId: userPaths.pathId }).from(userPaths).where(eq(userPaths.id, userPathId));
  if (!userPath) return NextResponse.json({ success: true, pathComplete: false });

  const [{ total }] = await db
    .select({ total: count(pathSteps.id) })
    .from(pathSteps)
    .where(eq(pathSteps.pathId, userPath.pathId));

  const [{ done }] = await db
    .select({ done: count(userProgress.id) })
    .from(userProgress)
    .where(eq(userProgress.userPathId, userPathId));

  const pathComplete = Number(done) >= Number(total) && Number(total) > 0;

  if (pathComplete) {
    await db.update(userPaths).set({ completedAt: new Date() }).where(eq(userPaths.id, userPathId));
  }

  return NextResponse.json({ success: true, pathComplete });
}
