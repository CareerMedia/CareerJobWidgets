import type { FeedConfig, FeedType } from "../../types/models";
import { handshakeFeedKey, isHandshakeFeedUrl } from "./feedUrl";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
}

function shortHash(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36).slice(0, 6);
}

/** Stable id for a feed URL + name (Handshake feeds use external_feeds/{id}). */
export function deriveFeedId(name: string, url: string): string {
  const hs = handshakeFeedKey(url);
  if (hs) return hs;
  const base = slugify(name) || "feed";
  return `${base}_${shortHash(url)}`;
}

export function deriveFeedType(url: string): FeedType {
  if (isHandshakeFeedUrl(url)) return "rss";
  const lower = url.toLowerCase();
  if (lower.includes(".json") || lower.includes("format=json")) return "json";
  if (lower.includes(".rss") || lower.includes("/rss") || lower.includes("rss.xml") || lower.includes("atom")) {
    return "rss";
  }
  return "auto";
}

export function finalizeFeedConfig(feed: FeedConfig, isNew: boolean): FeedConfig {
  const url = feed.url.trim();
  const name = feed.name.trim();
  const now = new Date().toISOString();
  return {
    ...feed,
    id: isNew ? deriveFeedId(name, url) : feed.id,
    name,
    url,
    type: isNew || feed.type === "auto" ? deriveFeedType(url) : feed.type,
    active: feed.active !== false,
    createdAt: feed.createdAt ?? now,
    updatedAt: now,
  };
}

export type SyncFeedPayload = {
  id: string;
  name: string;
  url: string;
  type: FeedType;
  description?: string;
  category?: string;
  active: boolean;
};

export function toSyncPayload(feed: FeedConfig): SyncFeedPayload {
  return {
    id: feed.id,
    name: feed.name,
    url: feed.url,
    type: feed.type,
    description: feed.description,
    category: feed.category,
    active: feed.active,
  };
}
