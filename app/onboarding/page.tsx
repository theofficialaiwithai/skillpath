import { Suspense } from "react";
import { db } from "@/lib/db";
import { skills as skillsTable } from "@/db/schema";
import OnboardingWizard from "./OnboardingWizard";

export default async function OnboardingPage() {
  const skills = await db.select().from(skillsTable);
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-65px)] flex items-center justify-center bg-bg-warm">
          <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OnboardingWizard skills={skills} />
    </Suspense>
  );
}
