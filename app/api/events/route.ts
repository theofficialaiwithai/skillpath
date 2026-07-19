import { NextResponse } from "next/server";
import { and, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { cachedEvents } from "@/db/schema";

interface EventbriteEvent {
  id: string;
  name: { text: string };
  url: string;
  start: { utc: string };
  online_event: boolean;
  venue?: {
    address?: {
      city?: string;
      region?: string;
      localized_address_display?: string;
    };
  };
}

interface EventbriteResponse {
  events?: EventbriteEvent[];
}

export interface EventResult {
  id: string;
  title: string;
  url: string;
  event_date: string | null;
  location: string | null;
  is_virtual: boolean;
  event_source: string;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const skill = searchParams.get("skill")?.trim();

  if (!skill) {
    return NextResponse.json({ error: "skill param required" }, { status: 400 });
  }

  // Slug → readable keyword: "prompt-engineering" → "prompt engineering"
  const skillKeyword = skill.replace(/-/g, " ");

  // ── 1. Cache check ────────────────────────────────────────────────────────
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  try {
    const cached = await db
      .select()
      .from(cachedEvents)
      .where(
        and(
          eq(cachedEvents.skillKeyword, skillKeyword),
          gte(cachedEvents.cachedAt, twentyFourHoursAgo)
        )
      );

    if (cached.length > 0) {
      const events: EventResult[] = cached.map((row) => ({
        id: row.id,
        title: row.eventTitle,
        url: row.eventUrl,
        event_date: row.eventDate?.toISOString() ?? null,
        location: row.eventLocation,
        is_virtual: row.isVirtual ?? false,
        event_source: row.source,
      }));
      return NextResponse.json({ events, from_cache: true });
    }
  } catch (err) {
    console.error("[api/events] cache read error:", err);
  }

  // ── 2. Fetch from Eventbrite ──────────────────────────────────────────────
  const apiKey = process.env.EVENTBRITE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ events: [] });
  }

  try {
    const params = new URLSearchParams({
      q: skillKeyword,
      sort_by: "date",
      expand: "venue",
      page_size: "6",
      "start_date.range_start": new Date().toISOString(),
    });

    const ebRes = await fetch(
      `https://www.eventbriteapi.com/v3/events/search/?${params.toString()}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );

    if (!ebRes.ok) {
      console.error("[api/events] Eventbrite error:", ebRes.status, await ebRes.text());
      return NextResponse.json({ events: [] });
    }

    const data = (await ebRes.json()) as EventbriteResponse;
    const rawEvents = data.events ?? [];

    // ── 3. Transform ────────────────────────────────────────────────────────
    const rows = rawEvents.map((ev) => {
      const city = ev.venue?.address?.city;
      const region = ev.venue?.address?.region;
      const location = ev.online_event
        ? "Online"
        : city && region
          ? `${city}, ${region}`
          : city ?? ev.venue?.address?.localized_address_display ?? null;

      return {
        skillKeyword,
        source: "eventbrite" as const,
        eventId: ev.id,
        eventTitle: ev.name.text,
        eventUrl: ev.url,
        eventDate: new Date(ev.start.utc),
        eventLocation: location,
        isVirtual: ev.online_event,
      };
    });

    // ── 4. Cache write ──────────────────────────────────────────────────────
    if (rows.length > 0) {
      try {
        await db.insert(cachedEvents).values(rows);
      } catch (err) {
        console.error("[api/events] cache write error:", err);
      }
    }

    const events: EventResult[] = rows.map((r) => ({
      id: r.eventId,
      title: r.eventTitle,
      url: r.eventUrl,
      event_date: r.eventDate.toISOString(),
      location: r.eventLocation,
      is_virtual: r.isVirtual,
      event_source: "eventbrite",
    }));

    return NextResponse.json({ events });
  } catch (err) {
    console.error("[api/events] fetch error:", err);
    return NextResponse.json({ events: [] });
  }
}
