"use client";

import { useEffect, useState } from "react";
import { Calendar, MapPin, Globe, ExternalLink } from "lucide-react";

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
  skillName: string;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Date TBD";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function EventsSection({ skillSlug, skillName }: EventsSectionProps) {
  const [events, setEvents] = useState<EventResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/events?skill=${encodeURIComponent(skillSlug)}`)
      .then((r) => r.json())
      .then((data) => setEvents(data.events ?? []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [skillSlug]);

  const lumaUrl = `https://lu.ma/search?q=${encodeURIComponent(skillName)}`;

  return (
    <section className="pt-10 pb-16">
      <div className="mb-6">
        <h2 className="font-fraunces text-2xl font-bold text-[#1A1A1A] mb-1">
          Events &amp; Community
        </h2>
        <p className="text-sm text-gray-500">
          Learn alongside others — in person and online
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-[#F0EBE3] p-5 animate-pulse"
            >
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#F0EBE3] p-8 text-center">
          <p className="text-gray-400 text-sm mb-4">
            No upcoming events found via Eventbrite.
          </p>
          <a
            href={lumaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[#FF4D2E] hover:text-orange-600 font-semibold text-sm transition-colors"
          >
            Browse on Luma instead <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {events.map((event) => (
              <a
                key={event.id}
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-2xl border border-[#F0EBE3] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <h3 className="font-semibold text-[#1A1A1A] text-sm leading-snug mb-3 group-hover:text-[#FF4D2E] transition-colors line-clamp-2">
                  {event.title}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                  {formatDate(event.event_date)}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                  {event.is_virtual ? (
                    <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  )}
                  {event.location ?? (event.is_virtual ? "Virtual" : "Location TBD")}
                </div>

                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF4D2E] group-hover:gap-1.5 transition-all">
                  View event <ExternalLink className="w-3 h-3" />
                </span>
              </a>
            ))}
          </div>

          <a
            href={lumaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1A1A1A] hover:text-[#FF4D2E] bg-white border border-[#F0EBE3] rounded-xl px-4 py-2.5 hover:border-[#FF4D2E]/30 transition-all duration-200"
          >
            Browse more on Luma →
          </a>
        </>
      )}
    </section>
  );
}
