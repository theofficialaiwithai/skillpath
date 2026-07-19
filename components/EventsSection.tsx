"use client";

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";

interface EventResult {
  id: string;
  title: string;
  url: string;
  event_date: string | null;
  location: string | null;
  is_virtual: boolean;
  event_source: string;
}

interface EventsSectionProps {
  skillSlug: string;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Date TBD";
  const d = new Date(dateStr);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[d.getUTCDay()]} ${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export default function EventsSection({ skillSlug }: EventsSectionProps) {
  const [events, setEvents] = useState<EventResult[]>([]);
  const [loading, setLoading] = useState(true);

  const skillKeyword = skillSlug.replace(/-/g, " ");
  const lumaUrl = `https://lu.ma/discover?q=${encodeURIComponent(skillKeyword)}`;

  useEffect(() => {
    fetch(`/api/events?skill=${encodeURIComponent(skillSlug)}`)
      .then((r) => r.json())
      .then((data) => setEvents(data.events ?? []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [skillSlug]);

  return (
    <section className="pt-10 pb-16">
      {/* Heading */}
      <div className="mb-6">
        <h2 className="font-fraunces text-2xl font-bold text-[#1A1A1A] mb-1">
          Events &amp; Community
        </h2>
        <p className="text-sm text-gray-500">
          Learn alongside others — in person and online
        </p>
      </div>

      {loading ? (
        /* Skeleton */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#F0EBE3] p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        /* Empty state */
        <div className="bg-white rounded-2xl border border-[#F0EBE3] px-6 py-8 flex flex-col items-start gap-3">
          <p className="text-sm text-gray-400">No upcoming events found.</p>
          <a
            href={lumaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-[#FF4D2E] hover:text-orange-600 transition-colors"
          >
            Browse on Luma →
          </a>
        </div>
      ) : (
        <>
          {/* Event cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl border border-[#F0EBE3] p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                {/* Title */}
                <h3 className="font-semibold text-[#1A1A1A] text-sm leading-snug line-clamp-2">
                  {event.title}
                </h3>

                {/* Date */}
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                  {formatDate(event.event_date)}
                </div>

                {/* Location pill / Virtual badge */}
                {event.is_virtual ? (
                  <span className="self-start text-xs font-medium px-2.5 py-1 rounded-full bg-[#FFF3E0] text-[#FF4D2E] border border-[#FFD5C2]">
                    Virtual
                  </span>
                ) : (
                  <span className="self-start text-xs font-medium px-2.5 py-1 rounded-full bg-[#FFF3E0] text-[#FF4D2E] border border-[#FFD5C2] truncate max-w-full">
                    {event.location ?? "Location TBD"}
                  </span>
                )}

                {/* CTA */}
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto self-start text-xs font-semibold text-[#FF4D2E] hover:text-orange-600 transition-colors"
                >
                  View event →
                </a>
              </div>
            ))}
          </div>

          {/* Luma CTA row */}
          <p className="text-sm text-gray-500">
            Looking for more?{" "}
            <a
              href={lumaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#1A1A1A] hover:text-[#FF4D2E] underline underline-offset-2 transition-colors"
            >
              Browse events on Luma →
            </a>
          </p>
        </>
      )}
    </section>
  );
}
