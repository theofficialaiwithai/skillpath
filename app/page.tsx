import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { skills as skillsTable } from "@/db/schema";
import HomepageSkillGrid from "@/components/HomepageSkillGrid";
import AISearch from "@/components/AISearch";

export const metadata: Metadata = {
  title: "Find Your Path",
  description:
    "Describe what you want to learn. We'll build the path — online resources, hands-on tutorials, and IRL events near you.",
};

const MARQUEE_SKILLS = [
  "Python for Data Science", "UX Design", "AI Prompting", "SQL",
  "Product Management", "Figma", "Machine Learning", "Copywriting",
  "No-Code Development", "Public Speaking", "Data Analysis", "Web Development",
];

export default async function Home() {
  const skills = await db.select().from(skillsTable);

  return (
    <div className="bg-[#FFFDF7]">

      {/* ── SECTION 1: HERO ──────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#FFF3E0] via-[#FFFDF7] to-[#F3F0FF] px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* Left — text */}
          <div className="flex flex-col gap-7">
            {/* Badge */}
            <span className="self-start bg-[#FFC629] text-[#1A1A1A] rounded-full px-4 py-1 text-sm font-medium">
              ✨ Social learning, reimagined
            </span>

            {/* Heading */}
            <h1 className="font-fraunces text-5xl md:text-7xl font-bold text-[#1A1A1A] leading-tight">
              Stop picking courses.<br />
              <span className="italic text-[#FF4D2E]">Start finishing them.</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg text-gray-600 max-w-md leading-relaxed">
              Describe what you want to learn. We&apos;ll build the path — online
              resources, hands-on tutorials, and IRL events near you.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/explore"
                className="bg-[#FF4D2E] text-white rounded-full px-8 py-4 text-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Find my path →
              </Link>
              <a
                href="#how-it-works"
                className="border-2 border-[#1A1A1A] text-[#1A1A1A] rounded-full px-8 py-4 text-lg font-semibold hover:bg-[#1A1A1A] hover:text-white transition-all duration-200"
              >
                See how it works
              </a>
            </div>

            {/* Social proof */}
            <p className="text-sm text-gray-500">
              Join 2,400+ learners building skills that matter
            </p>
          </div>

          {/* Right — photo (hidden on mobile) */}
          <div className="hidden md:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop"
              alt="People studying together"
              className="rounded-3xl object-cover w-full h-[500px] shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* ── AI SEARCH ────────────────────────────────────────────────────────── */}
      <section className="bg-[#FFFDF7] px-6 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            Or describe what you want to learn
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Tell us your goal and Claude will find the best path for you
          </p>
          <AISearch />
        </div>
      </section>

      {/* ── SECTION 2: MARQUEE ───────────────────────────────────────────────── */}
      <div className="bg-white border-y border-[#F0EBE3] py-5 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap gap-12">
          {[...MARQUEE_SKILLS, ...MARQUEE_SKILLS].map((skill, i) => (
            <span
              key={`${skill}-${i}`}
              className="text-sm font-medium text-gray-500 flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D2E] inline-block" />
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* ── SECTION 3: HOW IT WORKS ──────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-[#FFF3E0] px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-fraunces text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
              Learning that <span className="italic">actually works</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              No more tab switching. No more decision fatigue. Just your path.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 01 */}
            <div className="bg-white rounded-3xl p-8 shadow-sm">
              <div className="w-10 h-10 bg-[#FF4D2E] text-white rounded-full flex items-center justify-center font-bold text-sm mb-6">
                01
              </div>
              <h3 className="font-semibold text-xl text-[#1A1A1A] mb-3">Tell us your goal</h3>
              <p className="text-gray-500 leading-relaxed">
                Describe what you want to learn in plain English. No dropdowns, no checkboxes.
              </p>
            </div>

            {/* Card 02 */}
            <div className="bg-white rounded-3xl p-8 shadow-sm">
              <div className="w-10 h-10 bg-[#FFC629] text-[#1A1A1A] rounded-full flex items-center justify-center font-bold text-sm mb-6">
                02
              </div>
              <h3 className="font-semibold text-xl text-[#1A1A1A] mb-3">Get your curated path</h3>
              <p className="text-gray-500 leading-relaxed">
                Resources from YouTube, Udemy, books, and IRL events — sequenced so you don&apos;t have to think.
              </p>
            </div>

            {/* Card 03 */}
            <div className="bg-white rounded-3xl p-8 shadow-sm">
              <div className="w-10 h-10 bg-[#7C3AED] text-white rounded-full flex items-center justify-center font-bold text-sm mb-6">
                03
              </div>
              <h3 className="font-semibold text-xl text-[#1A1A1A] mb-3">Learn with your people</h3>
              <p className="text-gray-500 leading-relaxed">
                Track progress, embed resources, and find workshops and events happening near you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: SKILLS GRID ───────────────────────────────────────────── */}
      <section className="px-6 py-24 bg-[#FFFDF7]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-fraunces text-4xl md:text-5xl font-bold text-[#1A1A1A] text-center mb-14">
            10 skills. Every level.{" "}
            <span className="italic text-[#FF4D2E]">One path.</span>
          </h2>

          <HomepageSkillGrid skills={skills} />

          <p className="text-center text-sm text-gray-400 mt-14">
            Free to try · No credit card required · Built for self-directed learners
          </p>
        </div>
      </section>

      {/* ── SECTION 5: COMMUNITY CTA ─────────────────────────────────────────── */}
      <section className="px-6 pb-24 bg-[#FFFDF7]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Left — dark card */}
          <div className="bg-[#1A1A1A] text-white rounded-3xl p-12 flex flex-col justify-between gap-8">
            <div>
              <h2 className="font-fraunces text-4xl font-bold leading-tight mb-4">
                Learning is better{" "}
                <span className="italic text-[#FFC629]">together</span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Every path includes online resources AND in-person events near you. Find your people.
              </p>
            </div>
            <Link
              href="/explore"
              className="self-start bg-[#FF4D2E] text-white rounded-full px-8 py-4 font-semibold hover:bg-orange-600 transition-colors"
            >
              Find my people →
            </Link>
          </div>

          {/* Right — photo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1758270705518-b61b40527e76?w=800&auto=format&fit=crop"
            alt="Group of friends laughing together"
            className="rounded-3xl object-cover w-full min-h-[300px] h-full shadow-sm"
          />
        </div>
      </section>

    </div>
  );
}
