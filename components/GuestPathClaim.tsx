"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";

// ── Cookie helpers ─────────────────────────────────────────────────────────────

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? match.split("=")[1] : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function GuestPathClaim() {
  const router = useRouter();
  const [banner, setBanner] = useState<"success" | "limit" | null>(null);

  useEffect(() => {
    const token = readCookie("skillpath_guest");
    if (!token) return;

    // Fire-and-forget — errors silently so existing users never see breakage
    (async () => {
      try {
        const res = await fetch("/api/guest/claim", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ sessionToken: token }),
        });

        const data = await res.json() as {
          success: boolean;
          reason?: string;
          pathId?: string;
        };

        // Always clear the cookie — it's been handled one way or another
        deleteCookie("skillpath_guest");

        if (data.success) {
          setBanner("success");
          router.refresh(); // reload server data so the new path appears
        } else if (data.reason === "path_limit") {
          setBanner("limit");
        }
        // "expired" → silently do nothing; session is already gone
      } catch {
        // Network error — swallow silently; don't disrupt the user
        deleteCookie("skillpath_guest");
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!banner) return null;

  // ── Success banner ──────────────────────────────────────────────────────────

  if (banner === "success") {
    return (
      <div
        role="alert"
        className="mx-6 mt-4 flex items-center justify-between gap-3 rounded-2xl bg-green-50 border border-green-200 px-5 py-4 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm font-medium text-green-800">
            Your path has been saved! 🎉 Start learning below.
          </p>
        </div>
        <button
          onClick={() => setBanner(null)}
          aria-label="Dismiss"
          className="text-green-500 hover:text-green-700 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // ── Path-limit banner ────────────────────────────────────────────────────────

  return (
    <div
      role="alert"
      className="mx-6 mt-4 flex items-center justify-between gap-3 rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 shadow-sm"
    >
      <p className="text-sm font-medium text-amber-800">
        You&apos;ve reached your 2-path limit. Upgrade to unlock more paths.
      </p>
      <button
        onClick={() => setBanner(null)}
        aria-label="Dismiss"
        className="text-amber-500 hover:text-amber-700 transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
