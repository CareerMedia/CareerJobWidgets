import type { FeedConfig, FeedFetchError, FeedType, JobItem } from "../../types/models";
import { fetchFeedText } from "./feedFetch";
import { parseJsonToJobs } from "./jsonParse";
import { parseRssToJobs } from "./rssParse";

export async function fetchAndParseFeed(feed: FeedConfig, signal?: AbortSignal): Promise<
  | { ok: true; jobs: JobItem[] }
  | { ok: false; error: FeedFetchError }
> {
  const res = await fetchFeedText(feed, signal);
  if (!res.ok) return res;

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

