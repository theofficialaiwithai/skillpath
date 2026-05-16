import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { userProfiles } from "@/db/schema";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new Response("Invalid webhook signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email   = session.customer_details?.email ?? "";
    const subId   = typeof session.subscription === "string" ? session.subscription : null;

    if (email && subId) {
      await db
        .update(userProfiles)
        .set({ subscribed: true, subscriptionId: subId })
        .where(eq(userProfiles.email, email));
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    await db
      .update(userProfiles)
      .set({ subscribed: false })
      .where(eq(userProfiles.subscriptionId, sub.id));
  }

  return new Response("OK", { status: 200 });
}
