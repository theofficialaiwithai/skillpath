import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { skills, learningPaths, userPaths } from "@/db/schema";
import { FREE_PATH_LIMIT, getUserPathCount, isSubscribed } from "@/lib/subscription";

export async function POST(req: Request) {
  const body = await req.json();
  const { skillSlug, level, hoursPerWeek } = body as {
    skillSlug: string;
    level: string;
    hoursPerWeek: number;
  };

  if (!skillSlug || !level || !hoursPerWeek) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Find the learning path by skill slug + level
  const [result] = await db
    .select({ pathId: learningPaths.id })
    .from(learningPaths)
    .innerJoin(skills, eq(learningPaths.skillId, skills.id))
    .where(and(eq(skills.slug, skillSlug), eq(learningPaths.level, level)));

  if (!result) {
    return NextResponse.json(
      { error: "Path not found for this skill and level" },
      { status: 404 }
    );
  }

  // If authenticated, enforce limit then enroll
  const { userId } = await auth();

  if (userId) {
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
      .values({
        clerkUserId: userId,
        pathId: result.pathId,
        hoursPerWeek,
      })
      .onConflictDoNothing();
  }

  return NextResponse.json({ pathId: result.pathId });
}
