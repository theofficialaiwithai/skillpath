import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ExternalLink, Lock, Clock } from "lucide-react";
import { db } from "@/lib/db";
import { guestSessions, learningPaths, skills } from "@/db/schema";
import { getPersonalizedResources } from "@/lib/personalization";
import type { Budget, LearningStyle, Timeline } from "@/lib/personalization";

export const metadata: Metadata = { title: "Your Path Preview" };

// ── Platform badge colours ─────────────────────────────────────────────────────

const PLATFORM_BADGE: Record<string, { bg: string; text: string }> = {
  "YouTube":      { bg: "bg-red-100",    text: "text-red-700" },
  "Udemy":        { bg: "bg-orange-100", text: "text-orange-700" },
  "Coursera":     { bg: "bg-blue-100",   text: "text-blue-700" },
  "freeCodeCamp": { bg: "bg-gray-800",   text: "text-white" },
  "Blog":         { bg: "bg-gray-100",   text: "text-gray-700" },
  "Project":      { bg: "bg-yellow-100", text: "text-yellow-700" },
};

function platformBadge(platform: string) {
  return PLATFORM_BADGE[platform] ?? { bg: "bg-gray-100", text: "text-gray-700" };
}

// ── Readable label helpers ────────────────────────────────────────────────────

const LEVEL_LABEL: Record<string, string> = {
  beginner: "beginner", intermediate: "intermediate", advanced: "advanced",
};

const TIMELINE_LABEL: Record<string, string> = {
  asap: "ASAP", "1_3_months": "1–3 month", "3_6_months": "3–6 month", no_deadline: "open-ended",
};

const STYLE_LABEL: Record<string, string> = {
  visual: "visual", auditory: "auditory", experiential: "hands-on",
  symbolic: "reading-based", reflective: "reflective", social: "community-driven",
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const { session: token } = await searchParams;
  if (!token) notFound();

  // Load guest session
  const [sessionRow] = await db
    .select()
    .from(guestSessions)
    .where(eq(guestSessions.sessionToken, token))
    .limit(1);

  if (!sessionRow || !sessionRow.pathId) notFound();

  // Load path + skill metadata
  const [pathRow] = await db
    .select({ pathTitle: learningPaths.title, skillId: learningPaths.skillId })
    .from(learningPaths)
    .where(eq(learningPaths.id, sessionRow.pathId))
    .limit(1);

  if (!pathRow) notFound();

  const [skillRow] = await db
    .select({ name: skills.name })
    .from(skills)
    .where(eq(skills.id, pathRow.skillId))
    .limit(1);

  // Run personalization scoring
  const { resources } = await getPersonalizedResources({
    skillId:       pathRow.skillId,
    level:         sessionRow.level ?? "beginner",
    budget:        (sessionRow.budget as Budget) ?? "no_limit",
    learningStyles: (sessionRow.learningStyles as LearningStyle[]) ?? [],
    timeline:      (sessionRow.timeline as Timeline) ?? "no_deadline",
  });

  const skillName    = skillRow?.name ?? "Your skill";
  const levelLabel   = LEVEL_LABEL[sessionRow.level ?? ""] ?? sessionRow.level ?? "your";
  const timelineLabel = TIMELINE_LABEL[sessionRow.timeline ?? ""] ?? "your";
  const styleLabels  = (sessionRow.learningStyles ?? [])
    .map((s) => STYLE_LABEL[s] ?? s)
    .join(", ");

  const FREE_COUNT   = 3;
  const freeResources   = resources.slice(0, FREE_COUNT);
  const lockedResources = resources.slice(FREE_COUNT);
  const lockedCount     = lockedResources.length;

  return (
    // Extra bottom padding so sticky bar doesn't cover last card
    <div className="min-h-[calc(100vh-65px)] bg-bg-warm pb-32">
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-extrabold text-zinc-900 mb-3">
            Your {skillName} path is ready
          </h1>
          <p className="text-zinc-500 text-lg">
            Based on your <span className="font-medium text-zinc-700">{levelLabel} level</span>,{" "}
            <span className="font-medium text-zinc-700">{timelineLabel}</span> timeline
            {styleLabels && (
              <>, and <span className="font-medium text-zinc-700">{styleLabels}</span> learning preferences</>
            )}.
          </p>
        </div>

        {/* ── Free resource cards (1–3) ──────────────────────────────────── */}
        <div className="space-y-4 mb-6">
          {freeResources.map((resource, idx) => {
            const badge = platformBadge(resource.platform);
            return (
              <div
                key={resource.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Step number */}
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-brand/10 text-brand font-heading font-bold text-sm flex items-center justify-center">
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-heading font-bold text-zinc-900 text-lg leading-snug">
                        {resource.title}
                      </h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                        {resource.platform}
                      </span>
                    </div>

                    <p className="text-sm text-zinc-400 italic mb-3 line-clamp-2">{resource.whyItsHere}</p>

                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-sm text-zinc-500">
                        <Clock className="w-3.5 h-3.5" />
                        {resource.estimatedHours} hrs
                      </span>
                      {resource.costType === "free" || !resource.costUsd ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          Free
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          ${resource.costUsd}
                        </span>
                      )}
                    </div>
                  </div>

                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 flex items-center gap-1.5 border-2 border-zinc-200 hover:border-brand hover:text-brand text-zinc-600 font-semibold text-sm rounded-xl px-4 py-2 transition-colors whitespace-nowrap"
                  >
                    Open <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Locked resources ───────────────────────────────────────────── */}
        {lockedCount > 0 && (
          <div>
            {/* Lock banner */}
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-600 bg-zinc-100 rounded-xl px-4 py-3 mb-4">
              <Lock className="w-4 h-4 flex-shrink-0 text-zinc-500" />
              <span>
                🔒 {lockedCount} more resource{lockedCount !== 1 ? "s" : ""} in your full path —{" "}
                <Link href="/sign-up?redirect_url=/dashboard" className="text-brand font-semibold hover:underline">
                  create a free account to unlock
                </Link>
              </span>
            </div>

            {/* Blurred card previews */}
            <div className="space-y-4">
              {lockedResources.map((resource) => {
                const badge = platformBadge(resource.platform);
                return (
                  <div key={resource.id} className="relative">
                    {/* Blurred content */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 blur-sm opacity-60 select-none pointer-events-none">
                      <div className="flex items-start gap-4">
                        <span className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-heading font-bold text-zinc-900 text-lg">{resource.platform}</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                              {resource.platform}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-400 italic mb-3 truncate">
                            {resource.whyItsHere.slice(0, 40)}…
                          </p>
                          <div className="h-3 w-24 bg-gray-200 rounded" />
                        </div>
                        <div className="flex-shrink-0 w-24 h-9 bg-gray-200 rounded-xl" />
                      </div>
                    </div>

                    {/* Lock overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm rounded-xl px-5 py-3 flex items-center gap-2 shadow-sm border border-gray-100">
                        <Lock className="w-4 h-4 text-zinc-500" />
                        <span className="text-sm font-semibold text-zinc-700">
                          Unlock with a free account
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky CTA bar ─────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg px-6 py-4">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-zinc-700 text-center sm:text-left">
            <span className="font-semibold">Save your path and unlock all {resources.length} resources</span>
            {" "}— it&apos;s free
          </p>
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link
              href="/sign-up?redirect_url=/dashboard"
              className="bg-brand hover:bg-brand-dark text-white font-semibold rounded-xl px-6 py-2.5 text-sm transition-colors whitespace-nowrap"
            >
              Create free account
            </Link>
            <Link
              href="/sign-in?redirect_url=/dashboard"
              className="text-sm text-zinc-500 hover:text-zinc-800 transition-colors whitespace-nowrap"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
