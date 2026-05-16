import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { userProfiles } from "@/db/schema";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_MAP: Record<string, string> = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID!,
  yearly:  process.env.STRIPE_YEARLY_PRICE_ID!,
};

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await req.json();
  const priceId = PRICE_MAP[plan as string];
  if (!priceId) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const user  = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? "";

  // Get or create Stripe customer
  const [profile] = await db
    .select({ subscriptionId: userProfiles.subscriptionId })
    .from(userProfiles)
    .where(eq(userProfiles.clerkUserId, userId));

  let stripeCustomerId: string;

  if (profile?.subscriptionId?.startsWith("cus_")) {
    stripeCustomerId = profile.subscriptionId;
  } else {
    const customer = await stripe.customers.create({ email, metadata: { clerkUserId: userId } });
    stripeCustomerId = customer.id;

    await db
      .update(userProfiles)
      .set({ subscriptionId: stripeCustomerId })
      .where(eq(userProfiles.clerkUserId, userId));
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000") + "/dashboard?subscribed=true",
    cancel_url:  (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000") + "/pricing",
  });

  return NextResponse.json({ url: session.url });
}
