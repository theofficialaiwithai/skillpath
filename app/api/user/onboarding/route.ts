import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { skills, learningPaths, userProfiles, userPaths } from "@/db/schema";
import { getPersonalizedResources } from "@/lib/personalization";
import type { Budget, LearningStyle, Timeline, ResourceType } from "@/lib/personalization";
import { FREE_PATH_LIMIT, getUserPathCount, isSubscribed } from "@/lib/subscription";

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as {
    skillSlug: string;
    level: string;
    hoursPerWeek: number;
    budget: Budget;
    learningStyles: LearningStyle[];
    timeline: Timeline;
    resourceTypes?: ResourceType[];
  };

  const { skillSlug, level, hoursPerWeek, budget, learningStyles, timeline, resourceTypes } = body;

  if (!skillSlug || !level || !hoursPerWeek || !budget || !learningStyles?.length || !timeline) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // 0. Free-tier path limit check — must run before any DB writes
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

  // 1. Resolve skill + learning path
  const [pathRow] = await db
    .select({ pathId: learningPaths.id, skillId: skills.id })
    .from(learningPaths)
    .innerJoin(skills, eq(learningPaths.skillId, skills.id))
    .where(and(eq(skills.slug, skillSlug), eq(learningPaths.level, level)));

  if (!pathRow) {
    return NextResponse.json(
      { error: "No path found for this skill and level" },
      { status: 404 }
    );
  }

  // 2. Save personalization preferences to user_profiles
  await db
    .update(userProfiles)
    .set({ budget, learningStyles, timeline, ...(resourceTypes?.length ? { resourceTypes } : {}) })
    .where(eq(userProfiles.clerkUserId, userId));

  // 3. Enroll user in the path (idempotent — skip if already enrolled)
  //    Use .returning() so we get the row back (needed for pathId in the response).
  //    onConflictDoNothing returns an empty array when the row already exists,
  //    so fall back to pathRow.pathId which we already resolved above.
  const [inserted] = await db
    .insert(userPaths)
    .values({
      clerkUserId: userId,
      pathId: pathRow.pathId,
      hoursPerWeek,
    })
    .onConflictDoNothing()
    .returning();

  const resolvedPathId = inserted?.pathId ?? pathRow.pathId;

  // 4. Run personalization scoring so preferences are validated against actual resources
  //    (result is used downstream when the path page renders — not needed in this response)
  await getPersonalizedResources({
    skillId:        pathRow.skillId,
    level,
    budget,
    learningStyles,
    timeline,
    resourceTypes,
  });

  return NextResponse.json({ success: true, pathId: resolvedPathId });
}
