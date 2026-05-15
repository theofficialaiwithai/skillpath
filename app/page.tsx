import Link from "next/link";
import {
  Code2, Table2, Database, Globe, BarChart2, PenTool,
  Pencil, Video, DollarSign, Cpu,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { db } from "@/lib/db";
import { skills as skillsTable } from "@/db/schema";

const ICON_MAP: Record<string, LucideIcon> = {
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

export default async function Home() {
  const skills = await db.select().from(skillsTable);

  return (
    <div>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="bg-bg-warm flex flex-col items-center justify-center px-6 py-28 text-center">
        <h1 className="font-heading text-6xl lg:text-7xl font-extrabold text-zinc-900 leading-tight mb-6">
          Stop picking courses.
          <br />
          <span className="text-brand">Start finishing them.</span>
        </h1>
        <p className="text-lg text-zinc-500 max-w-xl leading-relaxed mb-10">
          Enter a skill, your level, and the hours you have. Get a sequenced
          path from the internet&apos;s best resources — across YouTube, Udemy,
          and free sites.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/onboarding"
            className="bg-brand hover:bg-brand-dark text-white font-semibold rounded-xl px-8 py-4 text-lg transition-colors"
          >
            Get my free path
          </Link>
          <a
            href="#how-it-works"
            className="border-2 border-brand text-brand font-semibold rounded-xl px-8 py-4 text-lg hover:bg-brand/5 transition-colors"
          >
            See how it works
          </a>
        </div>
      </section>

      {/* ── SKILLS GRID ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 bg-white">
        <h2 className="font-heading text-4xl font-bold text-zinc-900 text-center mb-12">
          10 skills. Every level. One path.
        </h2>

        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {skills.map((skill) => {
            const Icon = ICON_MAP[skill.icon] ?? Code2;
            return (
              <Link
                key={skill.id}
                href={`/onboarding?skill=${skill.slug}`}
                className={`${skill.cardColor} rounded-2xl p-6 flex flex-col gap-3 hover:scale-105 hover:shadow-lg transition-all duration-200 cursor-pointer`}
              >
                <Icon className="w-7 h-7 text-zinc-700" />
                <div>
                  <p className="font-heading font-bold text-zinc-900 text-sm leading-snug">
                    {skill.name}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">3 levels</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ── SOCIAL PROOF ────────────────────────────────────────────────── */}
        <p className="text-center text-sm text-zinc-400 mt-14">
          Free for 90 days · No credit card required · Built for self-directed learners
        </p>
      </section>
    </div>
  );
}
