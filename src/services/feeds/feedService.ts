import type { FeedConfig, FeedFetchError, FeedType, JobItem } from "../../types/models";
import { fetchBundledJobs } from "./feedBundled";
import { fetchFeedText } from "./feedFetch";
import { isHandshakeFeedUrl } from "./feedUrl";
import { parseJsonToJobs } from "./jsonParse";
import { parseRssToJobs } from "./rssParse";

function remapJobsForFeed(jobs: JobItem[], feed: FeedConfig): JobItem[] {
  return jobs.map((job) => ({
    ...job,
    feedId: feed.id,
    feedName: feed.name,
  }));
}

export async function fetchAndParseFeed(
  feed: FeedConfig,
  signal?: AbortSignal,
): Promise<
  | { ok: true; jobs: JobItem[]; fromCache?: boolean; cacheSyncedAt?: string }
  | { ok: false; error: FeedFetchError }
> {
  // Handshake blocks browser CORS — use bundled JSON cache first (no failed network request).
  if (isHandshakeFeedUrl(feed.url)) {
    const bundled = await fetchBundledJobs(feed);
    if (bundled.ok) {
      return {
        ok: true,
        jobs: remapJobsForFeed(bundled.jobs, feed),
        fromCache: true,
        cacheSyncedAt: bundled.syncedAt,
      };
    }
    return { ok: false, error: bundled.error };
  }

  const res = await fetchFeedText(feed, signal);
  if (!res.ok) {
    if (res.error.kind === "cors" || res.error.kind === "network") {
      const bundled = await fetchBundledJobs(feed);
      if (bundled.ok) {
        return {
          ok: true,
          jobs: remapJobsForFeed(bundled.jobs, feed),
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
