import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { eq, and, asc } from "drizzle-orm";
import { Clock, CheckCircle2, ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { learningPaths, skills, pathSteps, resources, userPaths, userProgress } from "@/db/schema";
import PathActions from "./PathActions";

// ── Config maps ───────────────────────────────────────────────────────────────

const LEVEL_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  beginner:     { bg: "bg-green-100",  text: "text-green-700",  label: "Beginner" },
  intermediate: { bg: "bg-purple-100", text: "text-purple-700", label: "Intermediate" },
  advanced:     { bg: "bg-red-100",    text: "text-red-700",    label: "Advanced" },
};

const STAGE_CONFIG: Record<string, { label: string; numBg: string; numText: string; dot: string }> = {
  foundation: { label: "Foundation",        numBg: "bg-blue-100",   numText: "text-blue-700",   dot: "bg-blue-400" },
  practice:   { label: "Applied Practice",  numBg: "bg-purple-100", numText: "text-purple-700", dot: "bg-purple-400" },
  project:    { label: "Portfolio Project", numBg: "bg-yellow-100", numText: "text-yellow-700", dot: "bg-yellow-400" },
};

const PLATFORM_CONFIG: Record<string, { bg: string; text: string }> = {
  "YouTube":      { bg: "bg-red-100",    text: "text-red-700" },
  "Udemy":        { bg: "bg-orange-100", text: "text-orange-700" },
  "Coursera":     { bg: "bg-blue-100",   text: "text-blue-700" },
  "freeCodeCamp": { bg: "bg-gray-800",   text: "text-white" },
  "Blog":         { bg: "bg-gray-100",   text: "text-gray-700" },
  "Project":      { bg: "bg-yellow-100", text: "text-yellow-700" },
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PathPage({ params }: { params: Promise<{ pathId: string }> }) {
  const { pathId } = await params;
  const { userId } = await auth();

  // 1. Fetch path + skill
  const [pathRow] = await db
    .select({
      pathId: learningPaths.id,
      title: learningPaths.title,
      description: learningPaths.description,
      totalHours: learningPaths.totalHours,
      level: learningPaths.level,
      skillName: skills.name,
      skillIcon: skills.icon,
    })
    .from(learningPaths)
    .innerJoin(skills, eq(learningPaths.skillId, skills.id))
    .where(eq(learningPaths.id, pathId));

  if (!pathRow) {
    return (
      <div className="min-h-[calc(100vh-65px)] bg-bg-warm flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-heading font-bold text-zinc-900 mb-2">Path not found</p>
          <Link href="/onboarding" className="text-brand hover:underline">
            ← Back to skills
          </Link>
        </div>
      </div>
    );
  }

  // 2. Fetch steps + resources
  const steps = await db
    .select({
      stepId: pathSteps.id,
      stepOrder: pathSteps.stepOrder,
      stage: pathSteps.stage,
      title: resources.title,
      platform: resources.platform,
      url: resources.url,
      costType: resources.costType,
      costUsd: resources.costUsd,
      estimatedHours: resources.estimatedHours,
      whyItsHere: resources.whyItsHere,
    })
    .from(pathSteps)
    .innerJoin(resources, eq(pathSteps.resourceId, resources.id))
    .where(eq(pathSteps.pathId, pathId))
    .orderBy(asc(pathSteps.stepOrder));

  // 3. Fetch user data if logged in
  let hoursPerWeek = 5;
  let isStarted = false;
  let completedStepIds = new Set<string>();
  let userPathId: string | null = null;

  if (userId) {
    const [userPath] = await db
      .select()
      .from(userPaths)
      .where(and(eq(userPaths.clerkUserId, userId), eq(userPaths.pathId, pathId)));

    if (userPath) {
      isStarted = true;
      hoursPerWeek = userPath.hoursPerWeek;
      userPathId = userPath.id;

      const progress = await db
        .select({ pathStepId: userProgress.pathStepId })
        .from(userProgress)
        .where(and(eq(userProgress.clerkUserId, userId), eq(userProgress.userPathId, userPath.id)));

      completedStepIds = new Set(progress.map((p) => p.pathStepId));
    }
  }

  // 4. Compute first incomplete step
  const firstIncompleteStep = steps.find((s) => !completedStepIds.has(s.stepId));

  // 5. Timeline calculation
  const weeksTotal = Math.ceil(pathRow.totalHours / hoursPerWeek);

  const stageHours = steps.reduce(
    (acc, s) => {
      acc[s.stage] = (acc[s.stage] || 0) + s.estimatedHours;
      return acc;
    },
    {} as Record<string, number>
  );

  const foundationWeeks = Math.ceil((stageHours.foundation || 0) / hoursPerWeek);
  const practiceWeeks = Math.ceil((stageHours.practice || 0) / hoursPerWeek);
  const projectWeeks = Math.ceil((stageHours.project || 0) / hoursPerWeek);

  const foundationRange = foundationWeeks > 0 ? `Week 1–${foundationWeeks}` : null;
  const practiceStart = foundationWeeks + 1;
  const practiceRange =
    practiceWeeks > 0 ? `Week ${practiceStart}–${practiceStart + practiceWeeks - 1}` : null;
  const projectStart = practiceStart + practiceWeeks;
  const projectRange =
    projectWeeks > 0 ? `Week ${projectStart}–${projectStart + projectWeeks - 1}` : null;

  const timelineSegments = [
    foundationRange && { range: foundationRange, ...STAGE_CONFIG.foundation },
    practiceRange  && { range: practiceRange,  ...STAGE_CONFIG.practice },
    projectRange   && { range: projectRange,   ...STAGE_CONFIG.project },
  ].filter(Boolean) as { range: string; label: string; numBg: string; numText: string; dot: string }[];

  const levelConf = LEVEL_CONFIG[pathRow.level] ?? LEVEL_CONFIG.beginner;

  return (
    <div className="min-h-[calc(100vh-65px)] bg-bg-warm">
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-10">
          {/* Back link */}
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800 mb-6 transition-colors"
          >
            ← All skills
          </Link>

          {/* Skill + level */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-medium text-zinc-600">{pathRow.skillName}</span>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${levelConf.bg} ${levelConf.text}`}
            >
              {levelConf.label}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-heading text-4xl font-extrabold text-zinc-900 leading-tight mb-4">
            {pathRow.title}
          </h1>

          {/* Description */}
          <p className="text-zinc-500 text-base leading-relaxed mb-6 max-w-2xl">
            {pathRow.description}
          </p>

          {/* Timeline summary */}
          <p className="text-sm text-zinc-500 mb-6">
            <span className="font-semibold text-zinc-700">{pathRow.totalHours} hours total</span>
            {" · "}Finish in{" "}
            <span className="font-semibold text-zinc-700">{weeksTotal} weeks</span>
            {" "}at{" "}
            <span className="font-semibold text-zinc-700">{hoursPerWeek} hrs/week</span>
          </p>

          {/* Action buttons */}
          <PathActions
            pathId={pathId}
            userId={userId}
            isStarted={isStarted}
            firstIncompleteStepId={firstIncompleteStep?.stepId ?? null}
          />
        </div>
      </div>

      {/* ── RESOURCE CARDS ──────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-4">
        {steps.map((step, idx) => {
          const stageCfg = STAGE_CONFIG[step.stage] ?? STAGE_CONFIG.foundation;
          const platformCfg = PLATFORM_CONFIG[step.platform] ?? { bg: "bg-gray-100", text: "text-gray-700" };
          const isCompleted = completedStepIds.has(step.stepId);
          const stepNum = String(idx + 1).padStart(2, "0");

          return (
            <div
              key={step.stepId}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-5">
                {/* Left: step number + stage label */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0 w-16">
                  <span
                    className={`font-heading font-bold text-lg w-12 h-12 rounded-full flex items-center justify-center ${stageCfg.numBg} ${stageCfg.numText}`}
                  >
                    {stepNum}
                  </span>
                  <span className="text-[10px] text-zinc-400 text-center leading-tight">
                    {stageCfg.label}
                  </span>
                </div>

                {/* Center: main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-heading font-bold text-zinc-900 text-lg leading-snug">
                      {step.title}
                    </h3>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${platformCfg.bg} ${platformCfg.text}`}
                    >
                      {step.platform}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-400 italic mb-3">{step.whyItsHere}</p>

                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-sm text-zinc-500">
                      <Clock className="w-3.5 h-3.5" />
                      {step.estimatedHours} hrs
                    </span>
                    {step.costType === "free" ? (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        Free
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        ${step.costUsd}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: action */}
                <div className="flex-shrink-0 flex items-center">
                  {isCompleted ? (
                    <div className="flex flex-col items-center gap-1 text-green-600">
                      <CheckCircle2 className="w-7 h-7" />
                      <span className="text-xs font-medium">Completed</span>
                    </div>
                  ) : (
                    <a
                      href={step.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 border-2 border-zinc-200 hover:border-brand hover:text-brand text-zinc-600 font-semibold text-sm rounded-xl px-4 py-2 transition-colors whitespace-nowrap"
                    >
                      Open resource
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── COMPLETION TIMELINE ─────────────────────────────────────────── */}
      {timelineSegments.length > 0 && (
        <div className="max-w-4xl mx-auto px-6 pb-16">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-heading font-bold text-zinc-900 text-sm uppercase tracking-wide mb-5">
              Your learning timeline
            </h2>
            <div className="flex items-center gap-0 flex-wrap">
              {timelineSegments.map((seg, i) => (
                <div key={seg.label} className="flex items-center gap-0">
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full ${seg.numBg} ${seg.numText}`}
                    >
                      {seg.range}
                    </span>
                    <span className="text-xs text-zinc-500">{seg.label}</span>
                  </div>
                  {i < timelineSegments.length - 1 && (
                    <span className="text-zinc-300 text-xl mx-3 mb-4">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
