"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  Code2, Table2, Database, Globe, BarChart2, PenTool,
  Pencil, Video, DollarSign, Cpu,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import UpgradeModal from "./UpgradeModal";

const ICON_MAP: Record<string, LucideIcon> = {
  "code-2": Code2, "table-2": Table2, "database": Database,
  "globe": Globe, "bar-chart-2": BarChart2, "pen-tool": PenTool,
  "pencil": Pencil, "video": Video, "dollar-sign": DollarSign, "cpu": Cpu,
};

interface Skill {
  id: string;
  slug: string;
  name: string;
  icon: string;
  cardColor: string;
}

interface Props {
  skills: Skill[];
}

/**
 * Client-side skill grid for the homepage.
 * Checks the free-tier path limit before navigating to /explore.
 * Shows UpgradeModal if the user is at their limit.
 */
export default function HomepageSkillGrid({ skills }: Props) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);

  async function handleSkillClick(slug: string) {
    // Signed-in users go through the authenticated 6-step onboarding wizard,
    // with a limit check first. Guests go straight to the explore (guest) wizard.
    if (!isSignedIn) {
      router.push(`/explore?skill=${slug}`);
      return;
    }

    setLoadingSlug(slug);
    try {
      const res = await fetch("/api/paths/check-limit");
      const data = (await res.json()) as { atLimit: boolean };
      if (data.atLimit) {
        setModalOpen(true);
      } else {
        router.push(`/onboarding?skill=${slug}`);
      }
    } catch {
      // On network error navigate normally — API will enforce server-side
      router.push(`/onboarding?skill=${slug}`);
    } finally {
      setLoadingSlug(null);
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {skills.map((skill) => {
          const Icon = ICON_MAP[skill.icon] ?? Code2;
          const isLoading = loadingSlug === skill.slug;
          return (
            <button
              key={skill.id}
              onClick={() => handleSkillClick(skill.slug)}
              disabled={loadingSlug !== null}
              className="rounded-3xl bg-white hover:-translate-y-1 transition-all duration-200 shadow-sm hover:shadow-md border border-[#F0EBE3] p-6 flex flex-col gap-3 cursor-pointer text-left disabled:opacity-70 disabled:translate-y-0"
            >
              <span className={`w-10 h-10 rounded-2xl flex items-center justify-center ${skill.cardColor}`}>
                <Icon className={`w-5 h-5 text-zinc-700 ${isLoading ? "animate-pulse" : ""}`} />
              </span>
              <div>
                <p className="font-semibold text-[#1A1A1A] text-sm leading-snug">
                  {skill.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">3 levels</p>
              </div>
            </button>
          );
        })}
      </div>

      <UpgradeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
