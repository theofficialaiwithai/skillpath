"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

type Plan = "monthly" | "yearly";

const FEATURES = [
  "Unlimited paths across all 10 skills",
  "Personalized timeline based on your hours",
  "Progress tracking across all paths",
  "New skills added monthly",
];

export default function PricingClient() {
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(plan: Plan) {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      setError("Stripe is not configured.");
      return;
    }
    setLoadingPlan(plan);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoadingPlan(null);
    }
  }

  return (
    <div className="min-h-[calc(100vh-65px)] bg-bg-warm">
      <div className="max-w-4xl mx-auto px-6 py-20">

        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-14"
        >
          <h1 className="font-heading text-5xl font-extrabold text-zinc-900 mb-4">
            Unlock every path.
          </h1>
          <p className="text-zinc-500 text-lg max-w-xl mx-auto">
            Free for 30 days. Then $9/month or $79/year — less than a single Udemy course.
          </p>
        </motion.div>

        {/* ── CARDS ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">

          {/* Monthly */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0, ease: "easeOut" }}
            className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col"
          >
            <p className="font-heading font-bold text-zinc-500 text-sm uppercase tracking-wide mb-4">
              Monthly
            </p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-heading font-extrabold text-5xl text-zinc-900">$9</span>
              <span className="text-zinc-400 text-base">/ month</span>
            </div>
            <div className="mb-8 h-5" />

            <ul className="space-y-3 mb-8 flex-1">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-zinc-700">
                  <Check className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleCheckout("monthly")}
              disabled={!!loadingPlan}
              className="w-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-semibold rounded-xl py-3 transition-colors"
            >
              {loadingPlan === "monthly" ? "Redirecting…" : "Start monthly plan"}
            </button>
          </motion.div>

          {/* Annual — highlighted */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className="relative bg-white rounded-2xl border-2 border-brand p-8 flex flex-col"
          >
            <span className="absolute top-4 right-4 bg-[#7C3AED] text-white text-sm font-semibold px-3 py-1 rounded-full">
              Most Popular
            </span>

            <p className="font-heading font-bold text-zinc-500 text-sm uppercase tracking-wide mb-4">
              Annual
            </p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-heading font-extrabold text-5xl text-zinc-900">$79</span>
              <span className="text-zinc-400 text-base">/ year</span>
            </div>
            <div className="mb-8 flex items-center gap-3">
              <span className="text-sm text-zinc-400">$6.58 / month</span>
              <span className="text-sm font-semibold text-green-600">Save 27%</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-zinc-700">
                  <Check className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleCheckout("yearly")}
              disabled={!!loadingPlan}
              className="w-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-semibold rounded-xl py-3 transition-colors"
            >
              {loadingPlan === "yearly" ? "Redirecting…" : "Start annual plan"}
            </button>
          </motion.div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-center text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-8">
            {error}
          </p>
        )}

        {/* Fine print */}
        <p className="text-center text-sm text-zinc-400 mb-16">
          Free 30-day access · Cancel anytime · No credit card required during trial
        </p>

        {/* ── FAQ ────────────────────────────────────────────────────── */}
        <div className="max-w-xl mx-auto space-y-6">
          <h2 className="font-heading font-bold text-xl text-zinc-900 text-center mb-8">
            Common questions
          </h2>
          {[
            {
              q: "What happens after 30 days?",
              a: "Your paths stay visible but you'll need a plan to start new ones or track progress.",
            },
            {
              q: "Can I cancel anytime?",
              a: "Yes. Cancel from your account settings. No questions asked.",
            },
            {
              q: "Is there a student discount?",
              a: "Email us. We'll sort you out.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="border-b border-zinc-100 pb-6">
              <p className="font-heading font-semibold text-zinc-900 mb-1">{q}</p>
              <p className="text-sm text-zinc-500">{a}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
