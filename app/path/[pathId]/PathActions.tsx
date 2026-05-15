"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Share2, Loader2 } from "lucide-react";

interface Props {
  pathId: string;
  userId: string | null;
  isStarted: boolean;
  firstIncompleteStepId: string | null;
}

export default function PathActions({ pathId, userId, isStarted, firstIncompleteStepId }: Props) {
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleStart() {
    setStarting(true);
    try {
      await fetch("/api/paths/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pathId }),
      });
      router.refresh();
    } finally {
      setStarting(false);
    }
  }

  async function handleShare() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-3">
      {/* Main CTA */}
      {!userId ? (
        <Link
          href="/sign-up"
          className="bg-brand hover:bg-brand-dark text-white font-semibold rounded-xl px-6 py-3 transition-colors"
        >
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
        <button
          onClick={handleStart}
          disabled={starting}
          className="bg-brand hover:bg-brand-dark disabled:opacity-70 text-white font-semibold rounded-xl px-6 py-3 transition-colors flex items-center gap-2"
        >
          {starting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Starting…
            </>
          ) : (
            "Start this path"
          )}
        </button>
      )}

      {/* Share button */}
      <div className="relative">
        <button
          onClick={handleShare}
          className="flex items-center gap-2 border-2 border-zinc-300 hover:border-brand hover:text-brand text-zinc-600 font-semibold rounded-xl px-4 py-3 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
        {copied && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-xs rounded-md px-2 py-1 whitespace-nowrap">
            Copied!
          </span>
        )}
      </div>
    </div>
  );
}
