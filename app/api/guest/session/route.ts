import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guestSessions } from "@/db/schema";

export async function POST(req: Request) {
  const body = await req.json() as {
    sessionToken: string;
    pathId: string;
    level: string;
    hoursPerWeek: number;
    budget: string;
    learningStyles: string[];
    timeline: string;
  };

  const { sessionToken, pathId, level, hoursPerWeek, budget, learningStyles, timeline } = body;

  if (!sessionToken || !pathId || !level || !hoursPerWeek || !budget || !learningStyles?.length || !timeline) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await db.insert(guestSessions).values({
    sessionToken,
    pathId,
    level,
    hoursPerWeek,
    budget,
    learningStyles,
    timeline,
  }).onConflictDoNothing();

  return NextResponse.json({ success: true });
}
