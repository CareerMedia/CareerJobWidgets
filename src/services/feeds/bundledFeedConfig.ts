import type { FeedConfig } from "../../types/models";
import { handshakeFeedKey, normalizeFeedUrl } from "./feedUrl";

type BundledFeedsConfigFile = {
  syncedAt?: string;
  feeds: Array<
    Pick<FeedConfig, "id" | "name" | "url" | "type" | "description" | "category" | "active">
  >;
};

/** Load feed definitions shipped with the synced JSON cache (from feeds.sync.json). */
export async function loadBundledFeedConfigs(cacheBust = false): Promise<FeedConfig[]> {
  const base = import.meta.env.BASE_URL;
  const suffix = cacheBust ? `?t=${Date.now()}` : "";
  try {
    const res = await fetch(`${base}data/feeds/feeds-config.json${suffix}`);
    if (!res.ok) return [];
    const data = (await res.json()) as BundledFeedsConfigFile;
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
  } catch {
    return [];
  }
}

export function mergeBundledFeeds(existing: FeedConfig[], bundled: FeedConfig[]): FeedConfig[] {
  if (bundled.length === 0) return existing;

  const byId = new Map(existing.map((f) => [f.id, f]));
  const byUrl = new Map(existing.map((f) => [normalizeFeedUrl(f.url), f]));

  for (const bf of bundled) {
    let match = byId.get(bf.id) ?? byUrl.get(normalizeFeedUrl(bf.url));
    if (!match) {
      const hs = handshakeFeedKey(bf.url);
      if (hs) match = existing.find((f) => handshakeFeedKey(f.url) === hs);
    }
    if (match) {
      byId.set(match.id, {
        ...match,
        name: bf.name,
        url: bf.url,
        type: bf.type,
        description: bf.description ?? match.description,
        category: bf.category ?? match.category,
        active: bf.active,
        updatedAt: bf.updatedAt,
      });
    } else {
      byId.set(bf.id, bf);
    }
  }

  return Array.from(byId.values());
}
