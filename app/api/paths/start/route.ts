import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { userPaths } from "@/db/schema";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { pathId } = await req.json();
  if (!pathId) {
    return NextResponse.json({ error: "Missing pathId" }, { status: 400 });
  }

  await db
    .insert(userPaths)
    .values({ clerkUserId: userId, pathId, hoursPerWeek: 5 })
    .onConflictDoNothing();

  return NextResponse.json({ success: true });
}
