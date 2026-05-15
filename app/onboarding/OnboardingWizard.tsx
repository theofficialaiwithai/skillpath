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

type Level = "beginner" | "intermediate" | "advanced";

interface Props {
  skills: SkillRow[];
}

// ── Icon maps ─────────────────────────────────────────────────────────────────

const SKILL_ICON_MAP: Record<string, LucideIcon> = {
  "code-2": Code2,
  "table-2": Table2,
  "database": Database,
  "globe": Globe,
  "bar-chart-2": BarChart2,
  "pen-tool": PenTool,
  "pencil": Pencil,
  "video": Video,
  "dollar-sign": DollarSign,
  "cpu": Cpu,
};

const LEVELS: { value: Level; label: string; subtitle: string; Icon: LucideIcon }[] = [
  { value: "beginner",     label: "Beginner",     subtitle: "Starting from scratch",                  Icon: Sprout },
  { value: "intermediate", label: "Intermediate", subtitle: "Know the basics, want to go deeper",     Icon: TrendingUp },
  { value: "advanced",     label: "Advanced",     subtitle: "Looking to master and specialize",       Icon: Zap },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function OnboardingWizard({ skills }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(1);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [hoursPerWeek, setHoursPerWeek] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-select skill from ?skill= query param
  useEffect(() => {
    const param = searchParams.get("skill");
    if (param) setSelectedSkill(param);
  }, [searchParams]);

  // ── Navigation helpers ───────────────────────────────────────────────────────

  function advance() {
    if (step === 1 && !selectedSkill) return;
    if (step === 2 && !selectedLevel) return;
    setStep((s) => s + 1);
  }

  function back() {
    setStep((s) => s - 1);
    setError(null);
  }

  // ── Form submission ──────────────────────────────────────────────────────────

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/paths/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillSlug: selectedSkill, level: selectedLevel, hoursPerWeek }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate path");
      router.push(`/path/${data.pathId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  const weeksEstimate = Math.ceil(15 / hoursPerWeek);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-[calc(100vh-65px)] bg-bg-warm flex flex-col items-center px-4 py-12">
      {/* Progress dots */}
      <div className="flex gap-2 mb-12">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`h-2 rounded-full transition-all duration-300 ${
              n === step ? "w-8 bg-brand" : n < step ? "w-4 bg-brand/40" : "w-4 bg-zinc-300"
            }`}
          />
        ))}
      </div>

      <div className="w-full max-w-3xl">
        {/* ── STEP 1: Pick a skill ──────────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <h1 className="font-heading text-4xl font-bold text-zinc-900 text-center mb-8">
              What do you want to learn?
            </h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {skills.map((skill) => {
                const Icon = SKILL_ICON_MAP[skill.icon] ?? Code2;
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
                    <p className="font-heading font-bold text-zinc-900 text-xs leading-snug">
                      {skill.name}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 2: Pick a level ──────────────────────────────────────────── */}
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

        {/* ── STEP 3: Hours per week ────────────────────────────────────────── */}
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
              At{" "}
              <span className="font-semibold text-zinc-800">{hoursPerWeek} hrs/week</span>,
              you&apos;ll finish in about{" "}
              <span className="font-semibold text-zinc-800">{weeksEstimate} weeks</span>.
            </p>

            {error && (
              <p className="mt-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {error}
              </p>
            )}
          </div>
        )}

        {/* ── Navigation ────────────────────────────────────────────────────── */}
        <div className="flex justify-between mt-10">
          {step > 1 ? (
            <button
              onClick={back}
              className="flex items-center gap-1 text-zinc-500 hover:text-zinc-800 font-medium transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={advance}
              disabled={(step === 1 && !selectedSkill) || (step === 2 && !selectedLevel)}
              className="bg-brand hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-8 py-3 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-brand hover:bg-brand-dark disabled:opacity-70 text-white font-semibold rounded-xl px-8 py-3 transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Building…
                </>
              ) : (
                "Build my path →"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
