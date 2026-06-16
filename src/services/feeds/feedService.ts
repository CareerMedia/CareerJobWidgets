import type { FeedConfig, FeedFetchError, FeedType, JobItem } from "../../types/models";
import { fetchFeedText } from "./feedFetch";
import { fetchBundledJobs } from "./feedBundled";
import { parseJsonToJobs } from "./jsonParse";
import { parseRssToJobs } from "./rssParse";

export async function fetchAndParseFeed(feed: FeedConfig, signal?: AbortSignal): Promise<
  | { ok: true; jobs: JobItem[]; fromCache?: boolean; cacheSyncedAt?: string }
  | { ok: false; error: FeedFetchError }
> {
  const res = await fetchFeedText(feed, signal);
  if (!res.ok) {
    // Handshake and similar feeds block browser fetches — fall back to build-time JSON cache.
    if (res.error.kind === "cors" || res.error.kind === "network") {
      const bundled = await fetchBundledJobs(feed);
      if (bundled.ok) {
        return {
          ok: true,
          jobs: bundled.jobs,
          fromCache: true,
          cacheSyncedAt: bundled.syncedAt,
        };
      }
      if (res.error.kind === "cors") {
        return {
          ok: false,
          error: {
            kind: "cors",
            message: `${res.error.message} ${bundled.error.message}`,
          },
        };
      }
    }
    return res;
  }

  const type = detectType(feed.type, res.text);
  try {
    const jobs =
      type === "rss"
        ? parseRssToJobs({ xmlText: res.text, feedId: feed.id, feedName: feed.name })
        : parseJsonToJobs({ jsonText: res.text, feedId: feed.id, feedName: feed.name });
    return { ok: true, jobs };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Parse error";
    return { ok: false, error: { kind: "parse", message: msg } };
  }
}

function detectType(configured: FeedType, bodyText: string): Exclude<FeedType, "auto"> {
  if (configured === "rss" || configured === "json") return configured;
  const t = bodyText.trim();
  if (t.startsWith("<")) return "rss";
  return "json";
}

