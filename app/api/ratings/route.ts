import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { resourceRatings } from "@/db/schema";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { resourceId, rating, note } = await req.json();

  if (!resourceId || typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid rating (must be 1–5)" }, { status: 400 });
  }

  await db
    .insert(resourceRatings)
    .values({ clerkUserId: userId, resourceId, rating, note: note ?? null })
    .onConflictDoUpdate({
      target: [resourceRatings.clerkUserId, resourceRatings.resourceId],
      set: { rating, note: note ?? null },
    });

  return NextResponse.json({ success: true });
}
