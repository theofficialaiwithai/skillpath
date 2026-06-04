"use client";

import { useState } from "react";
import { X, Zap } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: Props) {
  const [loading, setLoading] = useState<"monthly" | "yearly" | null>(null);

  if (!isOpen) return null;

  async function handleCheckout(plan: "monthly" | "yearly") {
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(null);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-heading"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-brand" />
            </div>
            <h2
              id="upgrade-heading"
              className="font-heading text-2xl font-extrabold text-zinc-900 mb-2"
            >
              You&apos;ve reached your 2-path limit
            </h2>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Upgrade to SkillPath Pro to build unlimited paths.
            </p>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Monthly */}
            <div className="border-2 border-gray-200 rounded-2xl p-5 flex flex-col gap-3 hover:border-brand/40 transition-colors">
              <div>
                <p className="font-heading font-bold text-zinc-900 text-lg">Monthly</p>
                <p className="text-3xl font-heading font-extrabold text-zinc-900 mt-1">
                  $9<span className="text-base font-medium text-zinc-400">/mo</span>
                </p>
              </div>
              <div className="space-y-1 text-sm text-zinc-500 flex-1">
                <p>Billed monthly</p>
                <p>Cancel anytime</p>
              </div>
              <button
                onClick={() => handleCheckout("monthly")}
                disabled={loading !== null}
                className="w-full border-2 border-brand text-brand font-semibold rounded-xl px-4 py-2.5 text-sm hover:bg-brand hover:text-white transition-all duration-200 disabled:opacity-50"
              >
                {loading === "monthly" ? "Redirecting…" : "Choose Monthly"}
              </button>
            </div>

            {/* Yearly — highlighted */}
            <div className="border-2 border-purple-600 rounded-2xl p-5 flex flex-col gap-3 relative">
              {/* Best value badge */}
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                Best value
              </span>
              <div>
                <p className="font-heading font-bold text-zinc-900 text-lg">Yearly</p>
                <p className="text-3xl font-heading font-extrabold text-zinc-900 mt-1">
                  $29<span className="text-base font-medium text-zinc-400">/yr</span>
                </p>
              </div>
              <div className="space-y-1 text-sm text-zinc-500 flex-1">
                <p>Billed annually</p>
                <p className="font-semibold text-purple-700">Save 73%</p>
              </div>
              <button
                onClick={() => handleCheckout("yearly")}
                disabled={loading !== null}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-all duration-200 disabled:opacity-50"
              >
                {loading === "yearly" ? "Redirecting…" : "Choose Yearly"}
              </button>
            </div>
          </div>

          {/* Dismiss */}
          <div className="text-center">
            <button
              onClick={onClose}
              className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              Keep my 2 paths for now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
