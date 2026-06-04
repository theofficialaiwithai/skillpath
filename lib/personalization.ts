import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { resources, pathSteps, learningPaths } from "@/db/schema";

// ── Types ─────────────────────────────────────────────────────────────────────

export type Budget = "free" | "under_50" | "50_200" | "no_limit";
export type LearningStyle =
  | "visual"
  | "auditory"
  | "experiential"
  | "symbolic"
  | "reflective"
  | "social";
export type Timeline = "asap" | "1_3_months" | "3_6_months" | "no_deadline";
export type ResourceType = "video" | "article" | "tutorial" | "course" | "community";

export interface PersonalizationParams {
  skillId: string;        // uuid — matches skills.id
  level: string;          // 'beginner' | 'intermediate' | 'advanced'
  budget: Budget;
  learningStyles: LearningStyle[];
  timeline: Timeline;
  resourceTypes?: ResourceType[];
}

export interface PersonalizationResult {
  resources: ScoredResource[];
  hasCommunity: boolean;
}

export interface ScoredResource {
  id: string;
  title: string;
  platform: string;
  url: string;
  costType: string;
  costUsd: string | null;
  estimatedHours: number;
  whyItsHere: string;
  type: string | null;
  isProjectBased: boolean;
  rating: number | null;
  qualityScore: number;
  score: number;          // composite personalization score
}

// ── Style → resource type mapping ────────────────────────────────────────────
//
// Each learning style gets bonus points when a resource's `type` matches.
// "social" has no specific resource type yet, so it spreads its bonus across
// collaborative / community-oriented content (courses with peer aspects).

const STYLE_TYPE_MAP: Record<LearningStyle, string[]> = {
  visual:       ["video"],
  auditory:     ["podcast", "video"],
  experiential: ["project"],
  symbolic:     ["docs", "course"],
  reflective:   ["article", "docs"],
  social:       ["course"],           // courses often have discussion forums
};

// ── Budget filter ─────────────────────────────────────────────────────────────

function passesBudget(
  costType: string,
  costUsd: string | null,
  budget: Budget
): boolean {
  if (costType === "free" || !costUsd) return true; // free resources pass any budget
  const cost = parseFloat(costUsd);
  switch (budget) {
    case "free":     return false;          // paid resource, budget is free-only
    case "under_50": return cost < 50;
    case "50_200":   return cost <= 200;
    case "no_limit": return true;
  }
}

// ── Scoring ───────────────────────────────────────────────────────────────────
//
// Base score = explicit rating (1–5) when set, otherwise quality_score / 20
// (quality_score is 0–100, so /20 maps it to a 0–5 scale).
// Each matching learning style adds +2.

function scoreResource(
  resource: {
    rating: number | null;
    qualityScore: number | null;
    type: string | null;
    isProjectBased: boolean | null;
  },
  learningStyles: LearningStyle[]
): number {
  const base =
    resource.rating != null
      ? resource.rating
      : (resource.qualityScore ?? 80) / 20;

  let bonus = 0;
  for (const style of learningStyles) {
    const matchingTypes = STYLE_TYPE_MAP[style];
    // Type match
    if (resource.type && matchingTypes.includes(resource.type)) {
      bonus += 2;
    }
    // Experiential also rewards project-based resources regardless of type field
    if (style === "experiential" && resource.isProjectBased) {
      bonus += 2;
    }
  }

  return base + bonus;
}

// ── Result limit by timeline ───────────────────────────────────────────────────

const TIMELINE_LIMIT: Record<Timeline, number> = {
  asap:         5,
  "1_3_months": 8,
  "3_6_months": 12,
  no_deadline:  12,
};

// ── Main export ───────────────────────────────────────────────────────────────

export async function getPersonalizedResources(
  params: PersonalizationParams
): Promise<PersonalizationResult> {
  const { skillId, level, budget, learningStyles, timeline, resourceTypes } = params;

  // 1. Fetch all resources for this skill + level via path_steps → learning_paths join
  const rows = await db
    .select({
      id:             resources.id,
      title:          resources.title,
      platform:       resources.platform,
      url:            resources.url,
      costType:       resources.costType,
      costUsd:        resources.costUsd,
      estimatedHours: resources.estimatedHours,
      whyItsHere:     resources.whyItsHere,
      type:           resources.type,
      isProjectBased: resources.isProjectBased,
      rating:         resources.rating,
      qualityScore:   resources.qualityScore,
    })
    .from(resources)
    .innerJoin(pathSteps, eq(pathSteps.resourceId, resources.id))
    .innerJoin(learningPaths, eq(pathSteps.pathId, learningPaths.id))
    .where(
      and(
        eq(learningPaths.skillId, skillId),
        eq(learningPaths.level, level)
      )
    );

  // 2. Filter by budget
  const budgetFiltered = rows.filter((r) =>
    passesBudget(r.costType, r.costUsd, budget)
  );

  // 3. Score each resource
  const scored: ScoredResource[] = budgetFiltered.map((r) => ({
    ...r,
    costUsd:        r.costUsd ?? null,
    isProjectBased: r.isProjectBased ?? false,
    rating:         r.rating ?? null,
    qualityScore:   r.qualityScore ?? 80,
    score:          scoreResource(r, learningStyles),
  }));

  // 4. Apply resourceTypes boosts
  if (resourceTypes?.length) {
    for (const r of scored) {
      if (resourceTypes.includes("video") && (r.type === "video" || r.type === "course")) {
        r.score += 2;
      }
      if (resourceTypes.includes("article") && (r.type === "article" || r.type === "docs")) {
        r.score += 2;
      }
      if (resourceTypes.includes("tutorial") && r.isProjectBased) {
        r.score += 2;
      }
    }
  }

  // 5. Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // 6. If 'course' not selected, push paid structured courses to the bottom
  if (resourceTypes?.length && !resourceTypes.includes("course")) {
    const main    = scored.filter((r) => !(r.costType === "paid" && r.type === "course"));
    const demoted = scored.filter((r) =>   r.costType === "paid" && r.type === "course");
    scored.splice(0, scored.length, ...main, ...demoted);
  }

  // 7. Limit by timeline
  const limit = TIMELINE_LIMIT[timeline];
  const finalResources = scored.slice(0, limit);

  return {
    resources: finalResources,
    hasCommunity: resourceTypes?.includes("community") ?? false,
  };
}
