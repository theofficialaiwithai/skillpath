"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Share2, Loader2, Clock, CheckCircle2, ExternalLink, Star,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type StepRow = {
  stepId: string;
  stepOrder: number;
  stage: string;
  title: string;
  platform: string;
  url: string;
  costType: string;
  costUsd: string | null;
  estimatedHours: number;
  whyItsHere: string;
  resourceId: string;
};

export type TimelineSegment = {
  range: string;
  label: string;
  numBg: string;
  numText: string;
};

type RatingEntry = {
  showing: boolean;
  rating: number;
  note: string;
  submitted: boolean;
  loading: boolean;
};

interface Props {
  pathId: string;
  pathTitle: string;
  userId: string | null;
  isStarted: boolean;
  firstIncompleteStepId: string | null;
  userPathId: string | null;
  steps: StepRow[];
  initialCompletedStepIds: string[];
  timelineSegments: TimelineSegment[];
  isPaywalled: boolean;
}

// ── Config ────────────────────────────────────────────────────────────────────

const STAGE_CONFIG: Record<string, { label: string; numBg: string; numText: string }> = {
  foundation: { label: "Foundation",        numBg: "bg-blue-100",   numText: "text-blue-700" },
  practice:   { label: "Applied Practice",  numBg: "bg-purple-100", numText: "text-purple-700" },
  project:    { label: "Portfolio Project", numBg: "bg-yellow-100", numText: "text-yellow-700" },
};

const PLATFORM_CONFIG: Record<string, { bg: string; text: string }> = {
  "YouTube":      { bg: "bg-red-100",    text: "text-red-700" },
  "Udemy":        { bg: "bg-orange-100", text: "text-orange-700" },
  "Coursera":     { bg: "bg-blue-100",   text: "text-blue-700" },
  "freeCodeCamp": { bg: "bg-gray-800",   text: "text-white" },
  "Blog":         { bg: "bg-gray-100",   text: "text-gray-700" },
  "Project":      { bg: "bg-yellow-100", text: "text-yellow-700" },
};

// ── StepCard subcomponent ─────────────────────────────────────────────────────

function StepCard({
  step, idx, isCompleted, isLoading, ratingEntry,
  userId, userPathId,
  onMarkComplete, onSetRating, onSetNote, onSubmitRating, onDismissRating,
}: {
  step: StepRow;
  idx: number;
  isCompleted: boolean;
  isLoading: boolean;
  ratingEntry: RatingEntry | undefined;
  userId: string | null;
  userPathId: string | null;
  onMarkComplete: (id: string) => void;
  onSetRating: (id: string, r: number) => void;
  onSetNote: (id: string, n: string) => void;
  onSubmitRating: (id: string, resourceId: string) => void;
  onDismissRating: (id: string) => void;
}) {
  const stageCfg    = STAGE_CONFIG[step.stage]    ?? STAGE_CONFIG.foundation;
  const platformCfg = PLATFORM_CONFIG[step.platform] ?? { bg: "bg-gray-100", text: "text-gray-700" };
  const stepNum     = String(idx + 1).padStart(2, "0");

  return (
    <div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
        <div className="flex gap-5">
          {/* Step number */}
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

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="font-heading font-bold text-zinc-900 text-lg leading-snug">
                {step.title}
              </h3>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${platformCfg.bg} ${platformCfg.text}`}>
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
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">Free</span>
              ) : (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">${step.costUsd}</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex flex-col items-end gap-2">
            <a
              href={step.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 border-2 border-zinc-200 hover:border-brand hover:text-brand text-zinc-600 font-semibold text-sm rounded-xl px-4 py-2 transition-colors whitespace-nowrap"
            >
              Open resource <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {isCompleted ? (
              <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-lg px-4 py-2">
                <CheckCircle2 className="w-4 h-4" /> Completed
              </div>
            ) : userId && userPathId ? (
              <button
                onClick={() => onMarkComplete(step.stepId)}
                disabled={isLoading}
                className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Mark complete ✓"}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Rating prompt */}
      {ratingEntry?.showing && (
        <div className="mt-2 bg-zinc-50 border border-zinc-200 rounded-2xl p-5">
          {ratingEntry.submitted ? (
            <p className="text-sm text-green-600 font-medium">Thanks for rating! 🙌</p>
          ) : (
            <>
              <p className="text-sm font-semibold text-zinc-700 mb-3">How was this resource?</p>
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => onSetRating(step.stepId, n)} className="hover:scale-110 transition-transform">
                    <Star className={`w-6 h-6 ${n <= ratingEntry.rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-300"}`} />
                  </button>
                ))}
              </div>
              <textarea
                value={ratingEntry.note}
                onChange={(e) => onSetNote(step.stepId, e.target.value)}
                placeholder="Any notes? (optional)"
                maxLength={200}
                rows={2}
                className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 mb-3"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onSubmitRating(step.stepId, step.resourceId)}
                  disabled={ratingEntry.rating === 0 || ratingEntry.loading}
                  className="bg-brand hover:bg-brand-dark disabled:opacity-50 text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors flex items-center gap-1.5"
                >
                  {ratingEntry.loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Submit rating
                </button>
                <button onClick={() => onDismissRating(step.stepId)} className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors">
                  Skip
                </button>
              </div>
            </>
          )}
        </div>
      )}
      {ratingEntry && !ratingEntry.showing && ratingEntry.submitted && (
        <p className="text-xs text-green-600 font-medium mt-1 pl-2">Thanks for rating! 🙌</p>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PathActions({
  pathId, pathTitle, userId, isStarted, firstIncompleteStepId,
  userPathId, steps, initialCompletedStepIds, timelineSegments, isPaywalled,
}: Props) {
  const router = useRouter();

  const [starting, setStarting]           = useState(false);
  const [copied, setCopied]               = useState(false);
  const [completedIds, setCompletedIds]   = useState(() => new Set(initialCompletedStepIds));
  const [loadingStep, setLoadingStep]     = useState<string | null>(null);
  const [celebrating, setCelebrating]     = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [ratingMap, setRatingMap]         = useState<Map<string, RatingEntry>>(new Map());

  useEffect(() => {
    if (celebrating) {
      const t = setTimeout(() => setBannerVisible(true), 30);
      return () => clearTimeout(t);
    }
  }, [celebrating]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function handleStart() {
    setStarting(true);
    try {
      await fetch("/api/paths/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pathId }) });
      router.refresh();
    } finally { setStarting(false); }
  }

  async function handleShare() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleMarkComplete(stepId: string) {
    if (!userPathId) return;
    setLoadingStep(stepId);
    try {
      const res  = await fetch("/api/progress/complete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pathStepId: stepId, userPathId }) });
      const data = await res.json();
      if (res.ok) {
        setCompletedIds((prev) => new Set([...prev, stepId]));
        setRatingMap((prev) => { const n = new Map(prev); n.set(stepId, { showing: true, rating: 0, note: "", submitted: false, loading: false }); return n; });
        if (data.pathComplete) setCelebrating(true);
      }
    } finally { setLoadingStep(null); }
  }

  function setRating(stepId: string, rating: number) {
    setRatingMap((prev) => { const n = new Map(prev); n.set(stepId, { ...(prev.get(stepId) ?? { showing: true, note: "", submitted: false, loading: false }), rating }); return n; });
  }

  function setNote(stepId: string, note: string) {
    setRatingMap((prev) => { const n = new Map(prev); n.set(stepId, { ...prev.get(stepId)!, note }); return n; });
  }

  async function handleSubmitRating(stepId: string, resourceId: string) {
    const entry = ratingMap.get(stepId);
    if (!entry || entry.rating === 0) return;
    setRatingMap((prev) => { const n = new Map(prev); n.set(stepId, { ...entry, loading: true }); return n; });
    await fetch("/api/ratings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resourceId, rating: entry.rating, note: entry.note }) });
    setRatingMap((prev) => { const n = new Map(prev); n.set(stepId, { ...entry, submitted: true, loading: false, showing: false }); return n; });
  }

  function dismissRating(stepId: string) {
    setRatingMap((prev) => { const n = new Map(prev); const e = prev.get(stepId); if (e) n.set(stepId, { ...e, showing: false }); return n; });
  }

  const completedCount = completedIds.size;
  const totalCount     = steps.length;
  const pct            = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Celebration banner */}
      {celebrating && (
        <div className={`mx-auto max-w-4xl px-6 pt-6 transition-all duration-500 ${bannerVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}>
          <div className="bg-yellow-400 rounded-2xl p-6">
            <p className="font-heading font-extrabold text-2xl text-zinc-900 mb-1">🎉 Path complete! You finished {pathTitle}.</p>
            <p className="text-zinc-700 text-sm mb-4">Time to start your next path.</p>
            <Link href="/onboarding" className="inline-block bg-zinc-900 text-white font-semibold rounded-xl px-5 py-2.5 text-sm hover:bg-zinc-800 transition-colors">
              Start your next path →
            </Link>
          </div>
        </div>
      )}

      {/* Start / Share buttons */}
      <div className="flex items-center gap-3">
        {!userId ? (
          <Link href="/sign-up" className="bg-brand hover:bg-brand-dark text-white font-semibold rounded-xl px-6 py-3 transition-colors">
            Sign up to track progress
          </Link>
        ) : isStarted ? (
          <Link
            href={firstIncompleteStepId ? `/path/${pathId}/step/${firstIncompleteStepId}` : `/path/${pathId}`}
            className="bg-brand hover:bg-brand-dark text-white font-semibold rounded-xl px-6 py-3 transition-colors"
          >
            Continue →
          </Link>
        ) : (
          <button onClick={handleStart} disabled={starting}
            className="bg-brand hover:bg-brand-dark disabled:opacity-70 text-white font-semibold rounded-xl px-6 py-3 transition-colors flex items-center gap-2"
          >
            {starting ? <><Loader2 className="w-4 h-4 animate-spin" />Starting…</> : "Start this path"}
          </button>
        )}

        <div className="relative">
          <button onClick={handleShare}
            className="flex items-center gap-2 border-2 border-zinc-300 hover:border-brand hover:text-brand text-zinc-600 font-semibold rounded-xl px-4 py-3 transition-colors"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
          {copied && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-xs rounded-md px-2 py-1 whitespace-nowrap">
              Copied!
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="max-w-4xl mx-auto px-6 pt-8">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm text-zinc-500">
            <span className="font-semibold text-zinc-700">{completedCount}</span> of{" "}
            <span className="font-semibold text-zinc-700">{totalCount}</span> steps complete
          </span>
          <span className="text-sm font-semibold text-zinc-700">{pct}%</span>
        </div>
        <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Resource cards */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* First card — always fully visible */}
        {steps.slice(0, 1).map((step, idx) => (
          <motion.div
            key={step.stepId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0, ease: "easeOut" }}
            className="mb-4"
          >
            <StepCard
              step={step} idx={idx}
              isCompleted={completedIds.has(step.stepId)}
              isLoading={loadingStep === step.stepId}
              ratingEntry={ratingMap.get(step.stepId)}
              userId={userId} userPathId={userPathId}
              onMarkComplete={handleMarkComplete}
              onSetRating={setRating} onSetNote={setNote}
              onSubmitRating={handleSubmitRating} onDismissRating={dismissRating}
            />
          </motion.div>
        ))}

        {/* Remaining cards — blurred if paywalled */}
        {steps.length > 1 && (
          <div className="relative space-y-4">
            {steps.slice(1).map((step, idx) => (
              <motion.div
                key={step.stepId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: (idx + 1) * 0.05, ease: "easeOut" }}
                className={isPaywalled ? "blur-sm pointer-events-none select-none" : ""}
              >
                <StepCard
                  step={step} idx={idx + 1}
                  isCompleted={completedIds.has(step.stepId)}
                  isLoading={loadingStep === step.stepId}
                  ratingEntry={ratingMap.get(step.stepId)}
                  userId={userId} userPathId={userPathId}
                  onMarkComplete={handleMarkComplete}
                  onSetRating={setRating} onSetNote={setNote}
                  onSubmitRating={handleSubmitRating} onDismissRating={dismissRating}
                />
              </motion.div>
            ))}

            {/* Paywall overlay */}
            {isPaywalled && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-sm w-full mx-4 text-center">
                  <h3 className="font-heading font-bold text-xl text-zinc-900 mb-2">Your free access has ended</h3>
                  <p className="text-zinc-500 text-sm mb-6">
                    Unlock unlimited paths for $9/month — less than a single Udemy course.
                  </p>
                  <Link href="/pricing" className="inline-block bg-brand hover:bg-brand-dark text-white font-semibold rounded-xl px-6 py-3 transition-colors mb-4">
                    See plans →
                  </Link>
                  <p className="text-xs text-zinc-400">You&apos;ve already made progress. It&apos;ll be here when you&apos;re back.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Completion timeline */}
      {timelineSegments.length > 0 && (
        <div className="max-w-4xl mx-auto px-6 pb-16">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-heading font-bold text-zinc-900 text-sm uppercase tracking-wide mb-5">Your learning timeline</h2>
            <div className="flex items-center flex-wrap gap-0">
              {timelineSegments.map((seg, i) => (
                <div key={seg.label} className="flex items-center gap-0">
                  <div className="flex flex-col items-center gap-1">
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${seg.numBg} ${seg.numText}`}>{seg.range}</span>
                    <span className="text-xs text-zinc-500">{seg.label}</span>
                  </div>
                  {i < timelineSegments.length - 1 && <span className="text-zinc-300 text-xl mx-3 mb-4">→</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sign-in banner */}
      {!userId && (
        <div className="bg-gray-900 text-white py-4 px-6 flex flex-wrap items-center justify-center gap-4 text-sm">
          <span>Sign in to track your progress and rate resources</span>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="bg-brand hover:bg-brand-dark text-white font-semibold rounded-lg px-4 py-2 transition-colors">Sign in</Link>
            <Link href="/sign-up" className="border border-white text-white hover:bg-white/10 font-semibold rounded-lg px-4 py-2 transition-colors">Sign up free</Link>
          </div>
        </div>
      )}
    </>
  );
}
