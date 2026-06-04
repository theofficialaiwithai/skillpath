"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Code2, Table2, Database, Globe, BarChart2, PenTool,
  Pencil, Video, DollarSign, Cpu,
  Check, Sprout, TrendingUp, Zap, Loader2, ChevronLeft,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type SkillRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  cardColor: string;
  createdAt: Date | null;
};

type Level         = "beginner" | "intermediate" | "advanced";
type Budget        = "free" | "under_50" | "50_200" | "no_limit";
type LearningStyle = "experiential" | "visual" | "auditory" | "symbolic" | "reflective" | "social";
type Timeline      = "asap" | "1_3_months" | "3_6_months" | "no_deadline";
type ResourceType  = "video" | "article" | "tutorial" | "course" | "community";

interface Props { skills: SkillRow[] }

// ── Static config ─────────────────────────────────────────────────────────────

const SKILL_ICON_MAP: Record<string, LucideIcon> = {
  "code-2": Code2, "table-2": Table2, "database": Database,
  "globe": Globe, "bar-chart-2": BarChart2, "pen-tool": PenTool,
  "pencil": Pencil, "video": Video, "dollar-sign": DollarSign, "cpu": Cpu,
};

const LEVELS: { value: Level; label: string; subtitle: string; Icon: LucideIcon }[] = [
  { value: "beginner",     label: "Beginner",     subtitle: "Starting from scratch",              Icon: Sprout },
  { value: "intermediate", label: "Intermediate", subtitle: "Know the basics, want to go deeper", Icon: TrendingUp },
  { value: "advanced",     label: "Advanced",     subtitle: "Looking to master and specialize",   Icon: Zap },
];

const BUDGET_OPTIONS: { value: Budget; emoji: string; label: string; description: string }[] = [
  { value: "free",     emoji: "🆓", label: "Free only", description: "YouTube, freeCodeCamp, and free resources only" },
  { value: "under_50", emoji: "💸", label: "Under $50", description: "A course or two if it's worth it" },
  { value: "50_200",   emoji: "💳", label: "$50–$200",  description: "Willing to invest in quality paid courses" },
  { value: "no_limit", emoji: "🚀", label: "No limit",  description: "Best resources, regardless of cost" },
];

const STYLE_OPTIONS: { value: LearningStyle; emoji: string; label: string; description: string }[] = [
  { value: "experiential", emoji: "🎯", label: "Experiential", description: "Learn by doing and building projects" },
  { value: "visual",       emoji: "👁️", label: "Visual",       description: "Videos, diagrams, and visual explanations" },
  { value: "auditory",     emoji: "🎧", label: "Auditory",      description: "Podcasts, lectures, and talking it through" },
  { value: "symbolic",     emoji: "📖", label: "Symbolic",      description: "Reading docs, articles, and written guides" },
  { value: "reflective",   emoji: "🤔", label: "Reflective",    description: "Taking notes, journaling, and processing" },
  { value: "social",       emoji: "👥", label: "Social",        description: "Communities, forums, and learning with others" },
];

const TIMELINE_OPTIONS: { value: Timeline; emoji: string; label: string; description: string }[] = [
  { value: "asap",        emoji: "⚡",  label: "ASAP",        description: "Under 30 days — I need this fast" },
  { value: "1_3_months",  emoji: "📅",  label: "1–3 months",  description: "Steady pace, specific deadline ahead" },
  { value: "3_6_months",  emoji: "🗓️",  label: "3–6 months",  description: "Building deep knowledge over time" },
  { value: "no_deadline", emoji: "🌊",  label: "No deadline", description: "Learning at my own pace" },
];

const RESOURCE_TYPE_OPTIONS: { value: ResourceType; emoji: string; label: string; description: string }[] = [
  { value: "video",     emoji: "🎬", label: "Videos",             description: "YouTube tutorials, recorded courses, video walkthroughs" },
  { value: "article",   emoji: "📚", label: "Books & Articles",   description: "Written guides, documentation, ebooks" },
  { value: "tutorial",  emoji: "🛠️", label: "Hands-on Tutorials", description: "Step-by-step projects, coding exercises, labs" },
  { value: "course",    emoji: "🎓", label: "Structured Courses", description: "Udemy, Coursera, cohort-based programs" },
  { value: "community", emoji: "👥", label: "Community",          description: "Slack groups, Discord servers, IRL meetups and events" },
];

const TOTAL_STEPS = 7;

// ── Shared card helpers ───────────────────────────────────────────────────────

function radioCardCls(selected: boolean) {
  return [
    "relative w-full rounded-2xl border-2 bg-white p-5 text-left cursor-pointer",
    "transition-all duration-150 hover:shadow-md hover:scale-[1.02]",
    selected ? "border-purple-600 shadow-md" : "border-zinc-200",
  ].join(" ");
}

function multiCardCls(selected: boolean) {
  return [
    "relative w-full rounded-2xl border-2 bg-white p-5 text-left cursor-pointer",
    "transition-all duration-150 hover:shadow-md hover:scale-[1.02]",
    selected ? "border-purple-600 shadow-md bg-purple-50/40" : "border-zinc-200",
  ].join(" ");
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ExploreWizard({ skills }: Props) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep]                     = useState(1);
  const [selectedSkill, setSelectedSkill]   = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel]   = useState<Level | null>(null);
  const [hoursPerWeek, setHoursPerWeek]     = useState(5);
  const [budget, setBudget]                 = useState<Budget | null>(null);
  const [learningStyles, setLearningStyles] = useState<LearningStyle[]>([]);
  const [timeline, setTimeline]             = useState<Timeline | null>(null);
  const [resourceTypes, setResourceTypes]   = useState<ResourceType[]>([]);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState<string | null>(null);

  useEffect(() => {
    const param = searchParams.get("skill");
    if (param) setSelectedSkill(param);
  }, [searchParams]);

  // ── Validation ───────────────────────────────────────────────────────────

  function stepIsValid(s: number) {
    if (s === 1) return !!selectedSkill;
    if (s === 2) return !!selectedLevel;
    if (s === 3) return hoursPerWeek >= 1;
    if (s === 4) return !!budget;
    if (s === 5) return learningStyles.length >= 1;
    if (s === 6) return !!timeline;
    if (s === 7) return resourceTypes.length >= 1;
    return true;
  }

  // ── Navigation ───────────────────────────────────────────────────────────

  function advance() {
    if (!stepIsValid(step)) return;
    setStep((s) => s + 1);
  }

  function back() {
    setStep((s) => s - 1);
    setError(null);
  }

  function toggleStyle(value: LearningStyle) {
    setLearningStyles((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  function toggleResourceType(value: ResourceType) {
    setResourceTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!stepIsValid(7) || !selectedSkill || !selectedLevel || !budget || !timeline || !resourceTypes.length) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Find the learning path for this skill + level
      const pathRes = await fetch("/api/paths/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillSlug: selectedSkill, level: selectedLevel, hoursPerWeek }),
      });
      const pathData = await pathRes.json();
      if (!pathRes.ok) throw new Error(pathData.error ?? "Could not find path");

      // 2. Generate a guest session token
      const sessionToken = crypto.randomUUID();

      // 3. Persist the guest session
      const sessionRes = await fetch("/api/guest/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionToken,
          pathId: pathData.pathId,
          level: selectedLevel,
          hoursPerWeek,
          budget,
          learningStyles,
          timeline,
          resourceTypes,
        }),
      });
      if (!sessionRes.ok) {
        const d = await sessionRes.json();
        throw new Error(d.error ?? "Failed to save session");
      }

      // 4. Store the token in a client-readable cookie (7 days)
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `skillpath_guest=${sessionToken}; expires=${expires}; path=/; SameSite=Lax`;

      // 5. Redirect to preview page
      router.push(`/path/preview?session=${sessionToken}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  const weeksEstimate = Math.ceil(15 / hoursPerWeek);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-[calc(100vh-65px)] bg-bg-warm flex flex-col items-center px-4 py-10">

      {/* Progress */}
      <div className="w-full max-w-3xl mb-10">
        <p className="text-sm font-semibold text-brand text-center mb-4">
          Step {step} of {TOTAL_STEPS}
        </p>
        <div className="flex gap-1.5 justify-center">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => (
            <div
              key={n}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                n === step ? "w-8 bg-brand" : n < step ? "w-4 bg-brand/40" : "w-4 bg-zinc-300"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-3xl">

        {/* ── STEP 1: Skill ──────────────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <h1 className="font-heading text-4xl font-bold text-zinc-900 text-center mb-2">
              What do you want to learn?
            </h1>
            <p className="text-zinc-500 text-center mb-8">No account needed — get your path in 2 minutes</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {skills.map((skill) => {
                const Icon       = SKILL_ICON_MAP[skill.icon] ?? Code2;
                const isSelected = selectedSkill === skill.slug;
                return (
                  <button
                    key={skill.id}
                    onClick={() => setSelectedSkill(skill.slug)}
                    className={`relative ${skill.cardColor} rounded-2xl p-5 flex flex-col gap-2 text-left transition-all duration-150 hover:scale-105 hover:shadow-md ${
                      isSelected ? "ring-2 ring-brand shadow-md scale-105" : ""
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 bg-brand text-white rounded-full p-0.5">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                    <Icon className="w-6 h-6 text-zinc-700" />
                    <p className="font-heading font-bold text-zinc-900 text-xs leading-snug">{skill.name}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 2: Level ──────────────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <h1 className="font-heading text-4xl font-bold text-zinc-900 text-center mb-8">
              What&apos;s your current level?
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {LEVELS.map(({ value, label, subtitle, Icon }) => {
                const isSelected = selectedLevel === value;
                return (
                  <button
                    key={value}
                    onClick={() => setSelectedLevel(value)}
                    className={`relative rounded-2xl border-2 bg-white p-8 flex flex-col items-center gap-3 text-center transition-all duration-150 hover:shadow-md hover:scale-[1.02] ${
                      isSelected ? "border-brand shadow-md" : "border-zinc-200"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-3 right-3 bg-brand text-white rounded-full p-0.5">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                    <Icon className={`w-10 h-10 ${isSelected ? "text-brand" : "text-zinc-400"}`} />
                    <p className="font-heading font-bold text-zinc-900 text-lg">{label}</p>
                    <p className="text-sm text-zinc-500">{subtitle}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 3: Hours ──────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="flex flex-col items-center">
            <h1 className="font-heading text-4xl font-bold text-zinc-900 text-center mb-12">
              How many hours per week can you commit?
            </h1>
            <div className="flex items-center gap-8 mb-6">
              <button
                onClick={() => setHoursPerWeek((h) => Math.max(1, h - 1))}
                className="w-14 h-14 rounded-full border-2 border-zinc-300 text-zinc-600 text-2xl font-bold hover:border-brand hover:text-brand transition-colors flex items-center justify-center"
              >
                −
              </button>
              <span className="font-heading text-8xl font-extrabold text-brand w-32 text-center tabular-nums">
                {hoursPerWeek}
              </span>
              <button
                onClick={() => setHoursPerWeek((h) => Math.min(20, h + 1))}
                className="w-14 h-14 rounded-full border-2 border-zinc-300 text-zinc-600 text-2xl font-bold hover:border-brand hover:text-brand transition-colors flex items-center justify-center"
              >
                +
              </button>
            </div>
            <p className="text-zinc-500 text-lg">
              At <span className="font-semibold text-zinc-800">{hoursPerWeek} hrs/week</span>,
              you&apos;ll finish in about{" "}
              <span className="font-semibold text-zinc-800">{weeksEstimate} weeks</span>.
            </p>
          </div>
        )}

        {/* ── STEP 4: Budget ─────────────────────────────────────────────── */}
        {step === 4 && (
          <div>
            <h1 className="font-heading text-4xl font-bold text-zinc-900 text-center mb-2">
              What&apos;s your budget for this skill?
            </h1>
            <p className="text-zinc-500 text-center mb-8">
              We&apos;ll filter resources to match what you&apos;re comfortable spending.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BUDGET_OPTIONS.map(({ value, emoji, label, description }) => {
                const isSelected = budget === value;
                return (
                  <button key={value} onClick={() => setBudget(value)} className={radioCardCls(isSelected)}>
                    {isSelected && (
                      <span className="absolute top-3 right-3 bg-purple-600 text-white rounded-full p-0.5">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                    <span className="text-3xl mb-2 block">{emoji}</span>
                    <p className="font-heading font-bold text-zinc-900 text-base mb-1">{label}</p>
                    <p className="text-sm text-zinc-500">{description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 5: Learning styles ─────────────────────────────────────── */}
        {step === 5 && (
          <div>
            <h1 className="font-heading text-4xl font-bold text-zinc-900 text-center mb-2">
              How do you learn best?
            </h1>
            <p className="text-zinc-500 text-center mb-8">Pick all that apply — most people are a mix</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {STYLE_OPTIONS.map(({ value, emoji, label, description }) => {
                const isSelected = learningStyles.includes(value);
                return (
                  <button
                    key={value}
                    onClick={() => toggleStyle(value)}
                    className={multiCardCls(isSelected)}
                  >
                    {isSelected && (
                      <span className="absolute top-3 right-3 bg-purple-600 text-white rounded-full p-0.5">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                    <span className="text-3xl mb-2 block">{emoji}</span>
                    <p className="font-heading font-bold text-zinc-900 text-base mb-1">{label}</p>
                    <p className="text-sm text-zinc-500">{description}</p>
                  </button>
                );
              })}
            </div>
            {learningStyles.length === 0 && (
              <p className="text-center text-sm text-zinc-400 mt-4">Select at least one to continue</p>
            )}
          </div>
        )}

        {/* ── STEP 6: Timeline ───────────────────────────────────────────── */}
        {step === 6 && (
          <div>
            <h1 className="font-heading text-4xl font-bold text-zinc-900 text-center mb-2">
              When do you need to know this?
            </h1>
            <p className="text-zinc-500 text-center mb-8">We&apos;ll pace your path to fit your deadline.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TIMELINE_OPTIONS.map(({ value, emoji, label, description }) => {
                const isSelected = timeline === value;
                return (
                  <button key={value} onClick={() => setTimeline(value)} className={radioCardCls(isSelected)}>
                    {isSelected && (
                      <span className="absolute top-3 right-3 bg-purple-600 text-white rounded-full p-0.5">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                    <span className="text-3xl mb-2 block">{emoji}</span>
                    <p className="font-heading font-bold text-zinc-900 text-base mb-1">{label}</p>
                    <p className="text-sm text-zinc-500">{description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 7: Resource types ──────────────────────────────────────── */}
        {step === 7 && (
          <div>
            <h1 className="font-heading text-4xl font-bold text-zinc-900 text-center mb-2">
              What types of resources do you prefer?
            </h1>
            <p className="text-zinc-500 text-center mb-8">
              Pick all that apply — we&apos;ll tailor your path
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {RESOURCE_TYPE_OPTIONS.map(({ value, emoji, label, description }) => {
                const isSelected = resourceTypes.includes(value);
                return (
                  <button
                    key={value}
                    onClick={() => toggleResourceType(value)}
                    className={multiCardCls(isSelected)}
                  >
                    {isSelected && (
                      <span className="absolute top-3 right-3 bg-purple-600 text-white rounded-full p-0.5">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                    <span className="text-3xl mb-2 block">{emoji}</span>
                    <p className="font-heading font-bold text-zinc-900 text-base mb-1">{label}</p>
                    <p className="text-sm text-zinc-500">{description}</p>
                  </button>
                );
              })}
            </div>
            {resourceTypes.length === 0 && (
              <p className="text-center text-sm text-zinc-400 mt-4">Select at least one to continue</p>
            )}
            {error && (
              <p className="mt-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {error}
              </p>
            )}
          </div>
        )}

        {/* ── Navigation ─────────────────────────────────────────────────── */}
        <div className="flex justify-between mt-10">
          {step > 1 ? (
            <button
              onClick={back}
              className="flex items-center gap-1 text-zinc-500 hover:text-zinc-800 font-medium transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < TOTAL_STEPS ? (
            <button
              onClick={advance}
              disabled={!stepIsValid(step)}
              className="bg-brand hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-8 py-3 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || resourceTypes.length === 0}
              className="bg-brand hover:bg-brand-dark disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-8 py-3 transition-colors flex items-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Building your path…</>
              ) : (
                "See my free path →"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
