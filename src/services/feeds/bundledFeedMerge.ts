import type { FeedConfig } from "../../types/models";
import { handshakeFeedKey, normalizeFeedUrl } from "./feedUrl";

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
