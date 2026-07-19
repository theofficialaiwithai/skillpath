"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, Sparkles, ChevronRight } from "lucide-react";
import UpgradeModal from "./UpgradeModal";

interface SearchResult {
  matched_skill: string;
  matched_skill_slug: string;
  matched_path_id: string;
  path_title: string;
  explanation: string;
  confidence: "high" | "medium" | "low";
}

const CONFIDENCE: Record<string, { label: string; cls: string }> = {
  high:   { label: "Strong match",  cls: "text-green-700 bg-green-50" },
  medium: { label: "Good match",    cls: "text-yellow-700 bg-yellow-50" },
  low:    { label: "Closest match", cls: "text-orange-700 bg-orange-50" },
};

export default function AISearch() {
  const router = useRouter();
  const [query, setQuery]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<SearchResult | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setResult(data as SearchResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleStartPath(slug: string) {
    setStarting(true);
    try {
      const res = await fetch("/api/paths/check-limit");
      const data = (await res.json()) as { atLimit: boolean; isSubscribed: boolean };
      if (data.atLimit && !data.isSubscribed) {
        setShowUpgrade(true);
        return;
      }
      router.push(`/onboarding?skill=${slug}`);
    } catch {
      router.push(`/onboarding?skill=${slug}`);
    } finally {
      setStarting(false);
    }
  }

  return (
    <>
      <div className="w-full max-w-2xl mx-auto">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. 'automate my business with AI in 2 weeks'"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-[#F0EBE3] bg-white text-[#1A1A1A] placeholder:text-gray-400 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF4D2E]/25 focus:border-[#FF4D2E] transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="flex items-center gap-2 px-5 py-3.5 bg-[#FF4D2E] hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-2xl transition-colors whitespace-nowrap"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {loading ? "Finding…" : "Search"}
          </button>
        </form>

        {/* Loading hint */}
        {loading && (
          <p className="text-center text-sm text-gray-400 mt-3">
            Finding your path…
          </p>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="mt-3 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Result card */}
        {result && !loading && (
          <div className="mt-3 bg-white rounded-2xl border border-[#F0EBE3] shadow-sm p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">
                  Best match
                </p>
                <h3 className="font-fraunces font-bold text-xl text-[#1A1A1A] leading-snug">
                  {result.path_title}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">{result.matched_skill}</p>
              </div>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${
                  CONFIDENCE[result.confidence]?.cls ?? CONFIDENCE.low.cls
                }`}
              >
                {CONFIDENCE[result.confidence]?.label ?? "Match"}
              </span>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-5">
              {result.explanation}
            </p>

            <button
              onClick={() => handleStartPath(result.matched_skill_slug)}
              disabled={starting}
              className="flex items-center gap-2 bg-[#FF4D2E] hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl px-5 py-2.5 transition-colors"
            >
              {starting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Start this path
              {!starting && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </>
  );
}
