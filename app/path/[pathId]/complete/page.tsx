import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { learningPaths, skills, pathSteps, userPaths } from "@/db/schema";
import Confetti from "@/components/Confetti";

export default async function PathCompletePage({
  params,
}: {
  params: Promise<{ pathId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { pathId } = await params;

  // ── Fetch path + skill info ─────────────────────────────────────────────────
  const [pathRow] = await db
    .select({
      pathTitle: learningPaths.title,
      skillName: skills.name,
      skillSlug: skills.slug,
    })
    .from(learningPaths)
    .innerJoin(skills, eq(learningPaths.skillId, skills.id))
    .where(eq(learningPaths.id, pathId))
    .limit(1);

  if (!pathRow) notFound();

  // ── Total resource count for this path ──────────────────────────────────────
  const [{ total }] = await db
    .select({ total: count(pathSteps.id) })
    .from(pathSteps)
    .where(eq(pathSteps.pathId, pathId));

  // ── Completion date from user_paths ─────────────────────────────────────────
  const [userPathRow] = await db
    .select({ completedAt: userPaths.completedAt })
    .from(userPaths)
    .where(eq(userPaths.pathId, pathId))
    .limit(1);

  const completedAt = userPathRow?.completedAt
    ? new Date(userPathRow.completedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  // ── User's first name from Clerk ────────────────────────────────────────────
  const user = await currentUser();
  const firstName = user?.firstName ?? "learner";

  // ── Tweet share URL ─────────────────────────────────────────────────────────
  const tweetText = `Just finished learning ${pathRow.skillName} with @SkillPathHQ 🎓 Who else is building their skills? skillpath-hazel.vercel.app`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 flex flex-col items-center justify-center px-6 py-16">
      {/* Confetti fires once on mount */}
      <Confetti />

      {/* 🎓 Icon */}
      <div style={{ fontSize: 80, lineHeight: 1 }} className="mb-6 select-none">
        🎓
      </div>

      {/* Heading */}
      <h1 className="font-heading text-5xl font-bold text-[#FF4D2E] text-center mb-4">
        You finished {pathRow.skillName}!
      </h1>

      {/* Subheading */}
      <p className="text-xl text-gray-600 text-center max-w-lg">
        That&apos;s {total} resource{Number(total) !== 1 ? "s" : ""} completed. You did the work,{" "}
        {firstName}.
      </p>

      {/* Completion date */}
      {completedAt && (
        <p className="text-sm text-gray-400 mt-2">Completed on {completedAt}</p>
      )}

      <hr className="my-8 w-24 border-gray-200" />

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link
          href="/onboarding"
          className="bg-[#FF4D2E] text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-orange-600 transition-colors"
        >
          Start your next path
        </Link>

        <a
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Share your win 🐦
        </a>
      </div>

      {/* Back to dashboard */}
      <Link
        href="/dashboard"
        className="text-sm text-gray-400 mt-8 hover:text-gray-600 transition-colors"
      >
        ← Back to dashboard
      </Link>
    </div>
  );
}
