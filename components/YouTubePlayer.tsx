"use client";

import { useEffect, useRef } from "react";
import { getYouTubeId } from "@/lib/youtube";

declare global {
  interface Window {
    YT: {
      Player: new (
        id: string,
        config: { events?: { onStateChange?: (e: { data: number }) => void } }
      ) => void;
      PlayerState: { ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YouTubePlayerProps {
  url: string;
  stepId: string;
  pathId: string;
  isSubscribed: boolean;
  autoCompleteEnabled?: boolean;
}

export default function YouTubePlayer({
  url, stepId, pathId, isSubscribed, autoCompleteEnabled = false,
}: YouTubePlayerProps) {
  const videoId = getYouTubeId(url);
  // Stable DOM id — created once per component mount
  const playerId = useRef(`yt-${Math.random().toString(36).slice(2, 9)}`).current;
  const markedComplete = useRef(false);

  useEffect(() => {
    if (!videoId || !isSubscribed) return;

    function handleStateChange(event: { data: number }) {
      if (
        event.data === window.YT.PlayerState.ENDED &&
        autoCompleteEnabled &&
        !markedComplete.current
      ) {
        markedComplete.current = true;
        fetch("/api/progress/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stepId, pathId }),
        }).catch(() => { /* silent — manual mark-complete still available */ });
      }
    }

    function createPlayer() {
      if (!document.getElementById(playerId)) return;
      new window.YT.Player(playerId, { events: { onStateChange: handleStateChange } });
    }

    if (typeof window.YT !== "undefined" && window.YT.Player) {
      createPlayer();
    } else {
      // Chain onto any existing onYouTubeIframeAPIReady (handles multiple players)
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        createPlayer();
      };
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const s = document.createElement("script");
        s.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(s);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, isSubscribed, stepId, pathId, playerId]);

  if (!videoId) return null;

  // ── Non-subscriber: thumbnail + upgrade overlay ───────────────────────────
  if (!isSubscribed) {
    return (
      <div className="mt-4">
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
            <span className="text-white text-4xl leading-none">▶</span>
            <span className="text-white text-sm font-medium">Upgrade to watch inline</span>
          </div>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#FF4D2E] hover:text-orange-600 transition-colors"
        >
          Watch on YouTube →
        </a>
      </div>
    );
  }

  // ── Subscriber: embedded iframe ───────────────────────────────────────────
  return (
    <div className="mt-4">
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
        <iframe
          id={playerId}
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video player"
        />
      </div>
      {autoCompleteEnabled && (
        <p className="mt-2 text-xs text-gray-400">
          Step auto-completed when video ends
        </p>
      )}
    </div>
  );
}
