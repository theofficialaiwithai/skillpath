import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { userPaths, userProfiles } from '@/db/schema'
import { eq, and, or, isNull } from 'drizzle-orm'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ atLimit: false, isSubscribed: false, pathCount: 0 })

  // Count active paths — treat NULL is_completed same as false (handles legacy rows)
  const activePaths = await db
    .select()
    .from(userPaths)
    .where(
      and(
        eq(userPaths.clerkUserId, userId),
        or(eq(userPaths.isCompleted, false), isNull(userPaths.isCompleted))
      )
    )

  const profile = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.clerkUserId, userId))
    .limit(1)

  const pathCount = activePaths.length
  const isSubscribed = profile[0]?.subscriptionStatus === 'active'
  const atLimit = pathCount >= 2

  console.log(`[check-limit] userId=${userId} pathCount=${pathCount} isSubscribed=${isSubscribed} atLimit=${atLimit}`)

  return NextResponse.json({ atLimit, isSubscribed, pathCount })
}
