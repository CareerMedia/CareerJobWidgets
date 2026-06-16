import type { FeedConfig } from "../../types/models";

const STORAGE_KEY = "cjw_feed_configs_v1";

export interface FeedStorage {
  load(): FeedConfig[];
  save(feeds: FeedConfig[]): void;
  exportJson(): string;
  importJson(jsonText: string): FeedConfig[];
}

function safeParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function isFeedConfigLike(x: unknown): x is FeedConfig {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.url === "string" &&
    (o.type === "auto" || o.type === "rss" || o.type === "json") &&
    typeof o.active === "boolean" &&
    typeof o.createdAt === "string" &&
    typeof o.updatedAt === "string"
  );
}

export const feedStorage: FeedStorage = {
  load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = safeParseJson(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isFeedConfigLike);
  },
  save(feeds) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(feeds));
  },
  exportJson() {
    return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), feeds: this.load() }, null, 2);
  },
  importJson(jsonText) {
    const parsed = safeParseJson(jsonText);
    if (!parsed || typeof parsed !== "object") throw new Error("Invalid JSON.");
    const obj = parsed as Record<string, unknown>;
    const feedsMaybe = Array.isArray(obj.feeds) ? obj.feeds : parsed;
    if (!Array.isArray(feedsMaybe)) throw new Error("JSON must be an array of feeds or an object with a feeds array.");
    const feeds = feedsMaybe.filter(isFeedConfigLike);
    if (feeds.length === 0) throw new Error("No valid feeds found in JSON.");
    return feeds;
  },
};

