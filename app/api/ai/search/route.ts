import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { skills, learningPaths } from "@/db/schema";

const client = new Anthropic();

export async function POST(req: Request) {
  try {
    const { query } = (await req.json()) as { query: string };

    if (!query?.trim()) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Pull all skills + paths for the prompt context
    const [allSkills, allPaths] = await Promise.all([
      db.select().from(skills),
      db.select().from(learningPaths),
    ]);

    const catalog = allSkills.map((skill) => ({
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

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system:
        "You are a learning path recommendation engine for SkillPath, a self-directed learning app. " +
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
    if (block.type !== "text") throw new Error("Unexpected response type from Claude");

    // Strip markdown code fences if Claude wraps the JSON anyway
    let jsonText = block.text.trim();
    const fenced = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenced) jsonText = fenced[1].trim();

    const result = JSON.parse(jsonText);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[ai/search]", err);
    return NextResponse.json(
      {
        error:
          "Couldn't find a matching path right now. Try describing your goal more specifically, or browse the skills below.",
      },
      { status: 500 }
    );
  }
}
