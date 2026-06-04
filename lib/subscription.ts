import { eq, and, count, or, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { userPaths, userProfiles } from "@/db/schema";

/** Free-tier users may have at most this many active (non-completed) paths. */
export const FREE_PATH_LIMIT = 2;

/**
 * Count active (non-completed) paths for a user.
 * This is the number that counts toward the free-tier limit.
 */
export async function getUserPathCount(userId: string): Promise<number> {
  // Count paths that are NOT completed — treat NULL the same as false
  // because existing rows created before the is_completed column was added have NULL.
  // SQL: WHERE clerk_user_id = ? AND (is_completed = false OR is_completed IS NULL)
  const [row] = await db
    .select({ n: count() })
    .from(userPaths)
    .where(
      and(
        eq(userPaths.clerkUserId, userId),
        or(eq(userPaths.isCompleted, false), isNull(userPaths.isCompleted))
      )
    );
  const result = Number(row?.n ?? 0);
  console.log(`[subscription] getUserPathCount(${userId}) →`, result);
  return result;
}

/**
 * Returns true if the user has an active Stripe subscription
 * (subscription_status === 'active').
 */
export async function isSubscribed(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ subscriptionStatus: userProfiles.subscriptionStatus })
    .from(userProfiles)
    .where(eq(userProfiles.clerkUserId, userId))
    .limit(1);
  const result = row?.subscriptionStatus === "active";
  console.log(
    `[subscription] isSubscribed(${userId}) → ${result} (status: ${row?.subscriptionStatus ?? "no profile row"})`
  );
  return result;
}
