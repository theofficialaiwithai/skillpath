import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { eq, and, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { learningPaths, skills, pathSteps, resources, userPaths, userProgress, userProfiles } from "@/db/schema";
import PathActions from "./PathActions";
import type { TimelineSegment } from "./PathActions";

// ── Config ────────────────────────────────────────────────────────────────────

const LEVEL_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  beginner:     { bg: "bg-green-100",  text: "text-green-700",  label: "Beginner" },
  intermediate: { bg: "bg-purple-100", text: "text-purple-700", label: "Intermediate" },
  advanced:     { bg: "bg-red-100",    text: "text-red-700",    label: "Advanced" },
};

const STAGE_TIMELINE: Record<string, { numBg: string; numText: string; label: string }> = {
  foundation: { numBg: "bg-blue-100",   numText: "text-blue-700",   label: "Foundation" },
  practice:   { numBg: "bg-purple-100", numText: "text-purple-700", label: "Applied Practice" },
  project:    { numBg: "bg-yellow-100", numText: "text-yellow-700", label: "Portfolio Project" },
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PathPage({ params }: { params: Promise<{ pathId: string }> }) {
  const { pathId } = await params;
  const { userId } = await auth();

  // 1. Fetch path + skill
  const [pathRow] = await db
    .select({
      pathId:      learningPaths.id,
      title:       learningPaths.title,
      description: learningPaths.description,
      totalHours:  learningPaths.totalHours,
      level:       learningPaths.level,
      skillName:   skills.name,
      skillIcon:   skills.icon,
    })
    .from(learningPaths)
    .innerJoin(skills, eq(learningPaths.skillId, skills.id))
    .where(eq(learningPaths.id, pathId));

  if (!pathRow) {
    return (
      <div className="min-h-[calc(100vh-65px)] bg-bg-warm flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-heading font-bold text-zinc-900 mb-2">Path not found</p>
          <Link href="/onboarding" className="text-brand hover:underline">← Back to skills</Link>
        </div>
      </div>
    );
  }

  // 2. Fetch steps + resources (includes resourceId for ratings)
  const steps = await db
    .select({
      stepId:         pathSteps.id,
      stepOrder:      pathSteps.stepOrder,
      stage:          pathSteps.stage,
      resourceId:     resources.id,
      title:          resources.title,
      platform:       resources.platform,
      url:            resources.url,
      costType:       resources.costType,
      costUsd:        resources.costUsd,
      estimatedHours: resources.estimatedHours,
      whyItsHere:     resources.whyItsHere,
    })
    .from(pathSteps)
    .innerJoin(resources, eq(pathSteps.resourceId, resources.id))
    .where(eq(pathSteps.pathId, pathId))
    .orderBy(asc(pathSteps.stepOrder));

  // 3. User data
  let hoursPerWeek = 5;
  let isStarted    = false;
  let completedStepIds: string[] = [];
  let userPathId: string | null  = null;
  let firstIncompleteStepId: string | null = null;

  if (userId) {
    const [userPath] = await db
      .select()
      .from(userPaths)
      .where(and(eq(userPaths.clerkUserId, userId), eq(userPaths.pathId, pathId)));

    if (userPath) {
      isStarted    = true;
      hoursPerWeek = userPath.hoursPerWeek;
      userPathId   = userPath.id;

      const progress = await db
        .select({ pathStepId: userProgress.pathStepId })
        .from(userProgress)
        .where(and(eq(userProgress.clerkUserId, userId), eq(userProgress.userPathId, userPath.id)));

      completedStepIds = progress.map((p) => p.pathStepId);
    }

    const completedSet = new Set(completedStepIds);
    firstIncompleteStepId = steps.find((s) => !completedSet.has(s.stepId))?.stepId ?? null;
  }

  // 4. Paywall check
  let isPaywalled = false;
  if (userId) {
    const [profile] = await db
      .select({ subscribed: userProfiles.subscribed, freeUntil: userProfiles.freeUntil })
      .from(userProfiles)
      .where(eq(userProfiles.clerkUserId, userId));

    if (profile && !profile.subscribed && profile.freeUntil && profile.freeUntil < new Date()) {
      isPaywalled = true;
    }
  }

  // 5. Timeline calculation
  const weeksTotal = Math.ceil(pathRow.totalHours / hoursPerWeek);

  const stageHours = steps.reduce((acc, s) => {
    acc[s.stage] = (acc[s.stage] || 0) + s.estimatedHours;
    return acc;
  }, {} as Record<string, number>);

  const foundationWeeks = Math.ceil((stageHours.foundation || 0) / hoursPerWeek);
  const practiceWeeks   = Math.ceil((stageHours.practice   || 0) / hoursPerWeek);
  const projectWeeks    = Math.ceil((stageHours.project    || 0) / hoursPerWeek);

  const practiceStart = foundationWeeks + 1;
  const projectStart  = practiceStart + practiceWeeks;

  const timelineSegments: TimelineSegment[] = [
    foundationWeeks > 0 && { range: `Week 1–${foundationWeeks}`,              ...STAGE_TIMELINE.foundation },
    practiceWeeks   > 0 && { range: `Week ${practiceStart}–${practiceStart + practiceWeeks - 1}`, ...STAGE_TIMELINE.practice },
    projectWeeks    > 0 && { range: `Week ${projectStart}–${projectStart + projectWeeks - 1}`,    ...STAGE_TIMELINE.project },
  ].filter(Boolean) as TimelineSegment[];

  const levelConf = LEVEL_CONFIG[pathRow.level] ?? LEVEL_CONFIG.beginner;

  return (
    <div className="min-h-[calc(100vh-65px)] bg-bg-warm">
      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800 mb-6 transition-colors"
          >
            ← All skills
          </Link>

          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-medium text-zinc-600">{pathRow.skillName}</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${levelConf.bg} ${levelConf.text}`}>
              {levelConf.label}
            </span>
          </div>

          <h1 className="font-heading text-4xl font-extrabold text-zinc-900 leading-tight mb-4">
            {pathRow.title}
          </h1>

          <p className="text-zinc-500 text-base leading-relaxed mb-6 max-w-2xl">
            {pathRow.description}
          </p>

          <p className="text-sm text-zinc-500 mb-6">
            <span className="font-semibold text-zinc-700">{pathRow.totalHours} hours total</span>
            {" · "}Finish in{" "}
            <span className="font-semibold text-zinc-700">{weeksTotal} weeks</span>
            {" "}at{" "}
            <span className="font-semibold text-zinc-700">{hoursPerWeek} hrs/week</span>
          </p>

          {/* Start/Share buttons rendered by PathActions */}
          <PathActions
            pathId={pathId}
            pathTitle={pathRow.title}
            userId={userId}
            isStarted={isStarted}
            firstIncompleteStepId={firstIncompleteStepId}
            userPathId={userPathId}
            steps={steps}
            initialCompletedStepIds={completedStepIds}
            timelineSegments={timelineSegments}
            isPaywalled={isPaywalled}
          />
        </div>
      </div>
    </div>
  );
}
