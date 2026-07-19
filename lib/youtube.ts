export function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);

    // youtube.com/watch?v=VIDEO_ID
    if (u.hostname.includes("youtube.com") && u.pathname === "/watch") {
      return u.searchParams.get("v");
    }

    // youtu.be/VIDEO_ID
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1);
      return id || null;
    }

    // youtube.com/embed/VIDEO_ID
    if (u.hostname.includes("youtube.com") && u.pathname.startsWith("/embed/")) {
      return u.pathname.split("/")[2] || null;
    }

    return null;
  } catch {
    return null;
  }
}
