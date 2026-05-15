import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { eq, desc, count, sum, and, inArray } from "drizzle-orm";
import {
  Code2, Table2, Database, Globe, BarChart2, PenTool,
  Pencil, Video, DollarSign, Cpu, CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { db } from "@/lib/db";
import {
  skills, learningPaths, pathSteps, resources,
  userPaths, userProgress,
} from "@/db/schema";

// ── Icon / color maps ─────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  "code-2": Code2, "table-2": Table2, "database": Database,
  "globe": Globe, "bar-chart-2": BarChart2, "pen-tool": PenTool,
  "pencil": Pencil, "video": Video, "dollar-sign": DollarSign, "cpu": Cpu,
};

const CARD_TO_BORDER: Record<string, string> = {
  "bg-blue-100":    "border-blue-400",
  "bg-green-100":   "border-green-400",
  "bg-orange-100":  "border-orange-400",
  "bg-purple-100":  "border-purple-400",
  "bg-cyan-100":    "border-cyan-400",
  "bg-pink-100":    "border-pink-400",
  "bg-yellow-100":  "border-yellow-400",
  "bg-red-100":     "border-red-400",
  "bg-emerald-100": "border-emerald-400",
  "bg-violet-100":  "border-violet-400",
};

const LEVEL_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  beginner:     { bg: "bg-green-100",  text: "text-green-700",  label: "Beginner" },
  intermediate: { bg: "bg-purple-100", text: "text-purple-700", label: "Intermediate" },
  advanced:     { bg: "bg-red-100",    text: "text-red-700",    label: "Advanced" },
};

function formatDate(d: Date | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // 1. Fetch all user paths with path + skill info
  const rawPaths = await db
    .select({
      userPathId: userPaths.id,
      pathId:     learningPaths.id,
      hoursPerWeek: userPaths.hoursPerWeek,
      startedAt:  userPaths.startedAt,
      completedAt: userPaths.completedAt,
      pathTitle:  learningPaths.title,
      totalHours: learningPaths.totalHours,
      level:      learningPaths.level,
      skillName:  skills.name,
      skillIcon:  skills.icon,
      skillCardColor: skills.cardColor,
    })
    .from(userPaths)
    .innerJoin(learningPaths, eq(userPaths.pathId, learningPaths.id))
    .innerJoin(skills, eq(learningPaths.skillId, skills.id))
    .where(eq(userPaths.clerkUserId, userId))
    .orderBy(desc(userPaths.startedAt));

  const pathIds    = rawPaths.map((p) => p.pathId);
  const userPathIds = rawPaths.map((p) => p.userPathId);

  // 2. Completed step counts per user_path
  const completedCountRows =
    userPathIds.length > 0
      ? await db
          .select({ userPathId: userProgress.userPathId, n: count(userProgress.id) })
          .from(userProgress)
          .where(and(eq(userProgress.clerkUserId, userId), inArray(userProgress.userPathId, userPathIds)))
          .groupBy(userProgress.userPathId)
      : [];

  const completedCountMap = new Map(completedCountRows.map((r) => [r.userPathId, Number(r.n)]));

  // 3. Total steps per path
  const totalStepRows =
    pathIds.length > 0
      ? await db
          .select({ pathId: pathSteps.pathId, n: count(pathSteps.id) })
          .from(pathSteps)
          .where(inArray(pathSteps.pathId, pathIds))
          .groupBy(pathSteps.pathId)
      : [];

  const totalStepMap = new Map(totalStepRows.map((r) => [r.pathId, Number(r.n)]));

  // 4. Completed hours per user_path (for time-remaining calc)
  const completedHourRows =
    userPathIds.length > 0
      ? await db
          .select({ userPathId: userProgress.userPathId, hrs: sum(resources.estimatedHours) })
          .from(userProgress)
          .innerJoin(pathSteps, eq(userProgress.pathStepId, pathSteps.id))
          .innerJoin(resources, eq(pathSteps.resourceId, resources.id))
          .where(and(eq(userProgress.clerkUserId, userId), inArray(userProgress.userPathId, userPathIds)))
          .groupBy(userProgress.userPathId)
      : [];

  const completedHoursMap = new Map(completedHourRows.map((r) => [r.userPathId, Number(r.hrs ?? 0)]));

  // 5. Summary stats
  const totalPathsStarted   = rawPaths.length;
  const totalStepsCompleted = completedCountRows.reduce((s, r) => s + Number(r.n), 0);
  const totalHoursInvested  = completedHourRows.reduce((s, r) => s + Number(r.hrs ?? 0), 0);

  // 6. Split active / completed
  const activePaths    = rawPaths.filter((p) => !p.completedAt);
  const completedPaths = rawPaths.filter((p) => !!p.completedAt);

  // 7. Skills for empty state
  const allSkills = activePaths.length === 0 ? await db.select().from(skills) : [];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-[calc(100vh-65px)] bg-bg-warm">
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* ── HEADER ───────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="font-heading text-4xl font-extrabold text-zinc-900 mb-1">
              Welcome back!
            </h1>
            <p className="text-zinc-500">Keep going. Every step compounds.</p>
          </div>
          <Link
            href="/onboarding"
            className="bg-brand hover:bg-brand-dark text-white font-semibold rounded-xl px-5 py-3 text-sm transition-colors whitespace-nowrap"
          >
            + Start a new path
          </Link>
        </div>

        {/* ── STATS ROW ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { label: "Paths started",   value: totalPathsStarted },
            { label: "Steps completed", value: totalStepsCompleted },
            { label: "Hours invested",  value: totalHoursInvested },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-3xl font-heading font-extrabold text-zinc-900">{value}</p>
              <p className="text-sm text-zinc-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* ── ACTIVE PATHS ─────────────────────────────────────────────── */}
        <section className="mb-12">
          <h2 className="font-heading font-bold text-xl text-zinc-900 mb-4">Your active paths</h2>

          {activePaths.length === 0 ? (
            <div>
              <div className="border-2 border-dashed border-zinc-200 rounded-2xl p-10 text-center mb-8">
                <p className="text-zinc-500 mb-4">You haven&apos;t started a path yet.</p>
                <Link
                  href="/onboarding"
                  className="inline-block bg-brand hover:bg-brand-dark text-white font-semibold rounded-xl px-6 py-3 transition-colors"
                >
                  Explore skills →
                </Link>
              </div>

              {/* Skill grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {allSkills.map((skill) => {
                  const Icon = ICON_MAP[skill.icon] ?? Code2;
                  return (
                    <Link
                      key={skill.id}
                      href={`/onboarding?skill=${skill.slug}`}
                      className={`${skill.cardColor} rounded-2xl p-5 flex flex-col gap-2 hover:scale-105 hover:shadow-md transition-all duration-150`}
                    >
                      <Icon className="w-6 h-6 text-zinc-700" />
                      <p className="font-heading font-bold text-zinc-900 text-xs leading-snug">{skill.name}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {activePaths.map((p) => {
                const completedSteps = completedCountMap.get(p.userPathId) ?? 0;
                const totalSteps     = totalStepMap.get(p.pathId) ?? 1;
                const completedHrs   = completedHoursMap.get(p.userPathId) ?? 0;
                const remainingHrs   = Math.max(0, p.totalHours - completedHrs);
                const weeksLeft      = Math.ceil(remainingHrs / p.hoursPerWeek);
                const pct            = Math.round((completedSteps / totalSteps) * 100);
                const borderClass    = CARD_TO_BORDER[p.skillCardColor] ?? "border-brand";
                const levelConf      = LEVEL_CONFIG[p.level] ?? LEVEL_CONFIG.beginner;
                const Icon           = ICON_MAP[p.skillIcon] ?? Code2;

                return (
                  <div
                    key={p.userPathId}
                    className={`bg-white rounded-2xl shadow-sm border-l-4 ${borderClass} px-6 py-5 hover:shadow-md transition-shadow`}
                  >
                    {/* Top row: skill + level */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Icon className="w-4 h-4" />
                        {p.skillName}
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${levelConf.bg} ${levelConf.text}`}>
                        {levelConf.label}
                      </span>
                    </div>

                    {/* Path title */}
                    <h3 className="font-heading font-bold text-lg text-zinc-900 mb-4">{p.pathTitle}</h3>

                    {/* Progress bar */}
                    <div className="mb-1">
                      <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 mb-3">
                      {completedSteps} of {totalSteps} steps complete
                    </p>

                    {/* Time remaining */}
                    <p className="text-xs text-zinc-400 mb-4">
                      {weeksLeft === 0 ? "Almost done!" : `~${weeksLeft} week${weeksLeft !== 1 ? "s" : ""} left`}
                    </p>

                    {/* Bottom row */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-400">Started {formatDate(p.startedAt)}</span>
                      <Link
                        href={`/path/${p.pathId}`}
                        className="bg-brand hover:bg-brand-dark text-white font-semibold text-sm rounded-lg px-4 py-2 transition-colors"
                      >
                        Continue →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── COMPLETED PATHS ──────────────────────────────────────────── */}
        {completedPaths.length > 0 && (
          <section>
            <h2 className="font-heading font-bold text-xl text-zinc-900 mb-4">Completed</h2>
            <div className="space-y-4">
              {completedPaths.map((p) => {
                const borderClass = CARD_TO_BORDER[p.skillCardColor] ?? "border-brand";
                const levelConf   = LEVEL_CONFIG[p.level] ?? LEVEL_CONFIG.beginner;
                const Icon        = ICON_MAP[p.skillIcon] ?? Code2;

                return (
                  <div
                    key={p.userPathId}
                    className={`bg-white rounded-2xl shadow-sm border-l-4 ${borderClass} overflow-hidden hover:shadow-md transition-shadow`}
                  >
                    {/* Completion banner */}
                    <div className="flex items-center gap-2 px-6 py-2 bg-green-50 border-b border-green-200 text-green-700 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      Completed {formatDate(p.completedAt)}
                    </div>

                    <div className="px-6 py-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                          <Icon className="w-4 h-4" />
                          {p.skillName}
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${levelConf.bg} ${levelConf.text}`}>
                          {levelConf.label}
                        </span>
                      </div>
                      <h3 className="font-heading font-bold text-lg text-zinc-900 mb-4">{p.pathTitle}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-400">Started {formatDate(p.startedAt)}</span>
                        <Link
                          href={`/path/${p.pathId}`}
                          className="border-2 border-zinc-200 hover:border-brand hover:text-brand text-zinc-600 font-semibold text-sm rounded-lg px-4 py-2 transition-colors"
                        >
                          Review path →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
