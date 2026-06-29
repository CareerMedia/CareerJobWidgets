import type { FeedConfig } from "../../types/models";
import { fetchBestFeedJson } from "./feedDataSources";

type BundledFeedsConfigFile = {
  syncedAt?: string;
  feeds: Array<
    Pick<FeedConfig, "id" | "name" | "url" | "type" | "description" | "category" | "active">
  >;
};

function mapFeedsConfig(data: BundledFeedsConfigFile): FeedConfig[] {
  if (!Array.isArray(data.feeds)) return [];
  const now = data.syncedAt ?? new Date().toISOString();
  return data.feeds.map((f) => ({
    id: f.id,
    name: f.name,
    url: f.url,
    type: f.type ?? "rss",
    description: f.description,
    category: f.category,
    active: f.active !== false,
    createdAt: now,
    updatedAt: now,
  }));
}

/** Load feed definitions from the repo (and deployed site); prefers the freshest copy. */
export async function loadBundledFeedConfigs(cacheBust = false): Promise<FeedConfig[]> {
  try {
    const data = await fetchBestFeedJson<BundledFeedsConfigFile>("feeds-config.json", cacheBust);
    if (!data) return [];
    return mapFeedsConfig(data);
  } catch {
    return [];
  }
}

export { mergeBundledFeeds } from "./bundledFeedMerge";
