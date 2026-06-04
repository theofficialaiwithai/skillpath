import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq, and, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { guestSessions, userPaths, userProfiles, learningPaths } from "@/db/schema";

export async function POST(req: Request) {
  // ── Auth ────────────────────────────────────────────────────────────────────

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionToken } = (await req.json()) as { sessionToken?: string };
  if (!sessionToken) {
    return NextResponse.json({ error: "sessionToken required" }, { status: 400 });
  }

  // ── Look up guest session ────────────────────────────────────────────────────

  const [session] = await db
    .select()
    .from(guestSessions)
    .where(eq(guestSessions.sessionToken, sessionToken))
    .limit(1);

  if (!session) {
    return NextResponse.json({ success: false, reason: "expired" });
  }

  // Check expiry in JS (expiresAt stored as timestamptz)
  const expiresAt = session.expiresAt ? new Date(session.expiresAt) : null;
  if (expiresAt && expiresAt < new Date()) {
    // Clean up expired row
    await db.delete(guestSessions).where(eq(guestSessions.sessionToken, sessionToken));
    return NextResponse.json({ success: false, reason: "expired" });
  }

  if (!session.pathId) {
    return NextResponse.json({ success: false, reason: "expired" });
  }

  // ── Check active-path limit (max 2) ─────────────────────────────────────────

  const [{ activeCount }] = await db
    .select({ activeCount: count() })
    .from(userPaths)
    .where(
      and(
        eq(userPaths.clerkUserId, userId),
        eq(userPaths.isCompleted, false)
      )
    );

  if (Number(activeCount) >= 2) {
    return NextResponse.json({ success: false, reason: "path_limit" });
  }

  // ── Get the skill ID for this path (needed for user_profiles update) ─────────

  const [pathRow] = await db
    .select({ skillId: learningPaths.skillId })
    .from(learningPaths)
    .where(eq(learningPaths.id, session.pathId))
    .limit(1);

  // ── Enroll user in path ──────────────────────────────────────────────────────

  await db
    .insert(userPaths)
    .values({
      clerkUserId: userId,
      pathId:      session.pathId,
      hoursPerWeek: session.hoursPerWeek ?? 5,
    })
    .onConflictDoNothing(); // idempotent — already enrolled is fine

  // ── Save personalization prefs to user_profiles ──────────────────────────────

  if (session.budget || session.learningStyles || session.timeline) {
    await db
      .update(userProfiles)
      .set({
        ...(session.budget         && { budget: session.budget }),
        ...(session.learningStyles && { learningStyles: session.learningStyles }),
        ...(session.timeline       && { timeline: session.timeline }),
      })
      .where(eq(userProfiles.clerkUserId, userId));
  }

  // ── Delete the claimed session ───────────────────────────────────────────────

  await db.delete(guestSessions).where(eq(guestSessions.sessionToken, sessionToken));

  return NextResponse.json({ success: true, pathId: session.pathId });
}
