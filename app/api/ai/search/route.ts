import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { skills, learningPaths } from "@/db/schema";

const client = new Anthropic();

export async function POST(req: Request) {
  // ── Stage 1: Parse body ──────────────────────────────────────────────────
  let query: string;
  try {
    const body = await req.json() as { query?: string };
    query = body.query ?? "";
    console.log("[ai/search] stage 1 — query:", query);
  } catch (err) {
    console.error("[ai/search] body parse error:", err);
    return NextResponse.json({ error: "Invalid request body", detail: String(err) }, { status: 400 });
  }

  if (!query.trim()) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  // ── Stage 2: Check API key ────────────────────────────────────────────────
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your_key_here") {
    console.error("[ai/search] ANTHROPIC_API_KEY is missing or is still a placeholder");
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured", detail: "Key is missing or placeholder" }, { status: 500 });
  }
  console.log("[ai/search] stage 2 — API key present, starts with:", apiKey.slice(0, 12) + "…");

  // ── Stage 3: DB fetch ─────────────────────────────────────────────────────
  let catalog: object[];
  try {
    const [allSkills, allPaths] = await Promise.all([
      db.select().from(skills),
      db.select().from(learningPaths),
    ]);
    console.log("[ai/search] stage 3 — skills:", allSkills.length, "paths:", allPaths.length);

    catalog = allSkills.map((skill) => ({
      slug: skill.slug,
      name: skill.name,
      description: skill.description,
      paths: allPaths
        .filter((p) => p.skillId === skill.id)
        .map((p) => ({
          id: p.id,
          title: p.title,
          level: p.level,
          totalHours: p.totalHours,
        })),
    }));
  } catch (err) {
    console.error("[ai/search] DB error:", err);
    return NextResponse.json({ error: "Database query failed", detail: String(err) }, { status: 500 });
  }

  // ── Stage 4: Claude call ──────────────────────────────────────────────────
  let rawText: string;
  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system:
        "You are a learning path recommendation engine for SkillPath. " +
        "Given a user's learning goal and the available skills/paths, return ONLY a valid JSON object — " +
        "no markdown, no code fences, no explanation outside the JSON.",
      messages: [
        {
          role: "user",
          content: `User's learning goal: "${query}"

Available skills and paths (JSON):
${JSON.stringify(catalog, null, 2)}

Return exactly this JSON shape:
{
  "matched_skill": "<display name of the best matching skill>",
  "matched_skill_slug": "<slug of that skill>",
  "matched_path_id": "<UUID of the best matching path>",
  "path_title": "<title of that path>",
  "explanation": "<2–3 sentences explaining why this path fits the user's goal>",
  "confidence": "<high|medium|low>"
}`,
        },
      ],
    });

    const block = message.content[0];
    if (block.type !== "text") throw new Error(`Unexpected content type: ${block.type}`);
    rawText = block.text;
    console.log("[ai/search] stage 4 — Claude raw response:", rawText);
  } catch (err) {
    console.error("[ai/search] Anthropic API error:", err);
    return NextResponse.json({ error: "Claude API call failed", detail: String(err) }, { status: 500 });
  }

  // ── Stage 5: Parse JSON ───────────────────────────────────────────────────
  try {
    let jsonText = rawText.trim();
    // Strip markdown code fences if present
    const fenced = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenced) jsonText = fenced[1].trim();

    const result = JSON.parse(jsonText);
    console.log("[ai/search] stage 5 — parsed result:", result);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[ai/search] JSON parse error. Raw text was:", rawText);
    console.error("[ai/search] parse error:", err);
    return NextResponse.json(
      { error: "Failed to parse Claude response", detail: String(err), raw: rawText },
      { status: 500 }
    );
  }
}
