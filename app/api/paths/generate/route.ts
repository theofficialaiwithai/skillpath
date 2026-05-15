import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { skills, learningPaths, userPaths } from "@/db/schema";

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

  // If authenticated, enroll the user
  const { userId } = await auth();

  if (userId) {
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
