import type { FeedConfig, FeedFetchError } from "../../types/models";

export async function fetchFeedText(feed: FeedConfig, signal?: AbortSignal): Promise<{ ok: true; text: string } | { ok: false; error: FeedFetchError }> {
  try {
    const res = await fetch(feed.url, { method: "GET", signal });
    if (!res.ok) {
      return { ok: false, error: { kind: "network", message: `Request failed (${res.status}).` } };
    }
    const text = await res.text();
    return { ok: true, text };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";

    // CORS note:
    // If a feed does not send Access-Control-Allow-Origin headers that permit browser fetches
    // from your GitHub Pages origin, this static app cannot bypass it.
    // (You would need a proxy, which we are intentionally not using.)
    if (msg.toLowerCase().includes("cors") || msg.toLowerCase().includes("failed to fetch")) {
      return {
        ok: false,
        error: {
          kind: "cors",
          message:
            "This feed may block browser-based fetching (CORS). Many RSS/JSON sources do not allow requests from GitHub Pages origins. Try a source that supports CORS, or host the feed somewhere that allows it.",
        },
      };
    }

    return { ok: false, error: { kind: "unknown", message: msg } };
  }
}

