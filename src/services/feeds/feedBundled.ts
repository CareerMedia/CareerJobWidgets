import type { FeedConfig, FeedFetchError, JobItem } from "../../types/models";
import { fetchBestFeedJson, fetchFeedCacheFile } from "./feedDataSources";
import { handshakeFeedKey, normalizeFeedUrl } from "./feedUrl";

type BundledManifest = {
  syncedAt?: string;
  urlIndex?: Record<string, string>;
  normalizedUrlIndex?: Record<string, string>;
  handshakeFeedIndex?: Record<string, string>;
  idIndex?: Record<string, string>;
  feeds?: Record<string, { url: string; file: string; jobCount: number }>;
};

type BundledFeedFile = {
  feedId: string;
  syncedAt?: string;
  jobs: JobItem[];
};

function resolveCacheFile(manifest: BundledManifest, feed: FeedConfig): string | undefined {
  const candidates = [
    manifest.urlIndex?.[feed.url],
    manifest.normalizedUrlIndex?.[normalizeFeedUrl(feed.url)],
    manifest.idIndex?.[feed.id],
  ];
  for (const c of candidates) {
    if (c) return c;
  }

  const hsKey = handshakeFeedKey(feed.url);
  if (hsKey && manifest.handshakeFeedIndex?.[hsKey]) {
    return manifest.handshakeFeedIndex[hsKey];
  }

  if (manifest.feeds) {
    const targetKey = handshakeFeedKey(feed.url);
    if (targetKey) {
      for (const entry of Object.values(manifest.feeds)) {
        if (handshakeFeedKey(entry.url) === targetKey) return entry.file;
      }
    }
  }

  return undefined;
}

/**
 * Handshake and many RSS hosts block browser CORS.
 * Job data is loaded from the repo cache (and deployed site when available).
 */
export async function fetchBundledJobs(
  feed: FeedConfig,
): Promise<{ ok: true; jobs: JobItem[]; syncedAt?: string } | { ok: false; error: FeedFetchError }> {
  try {
    const manifest = await fetchBestFeedJson<BundledManifest>("manifest.json", true);
    if (!manifest) {
      return {
        ok: false,
        error: {
          kind: "network",
          message: "No feed cache found yet. Save the feed in admin and wait for sync to finish.",
        },
      };
    }

    const file = resolveCacheFile(manifest, feed);
    if (!file) {
      return {
        ok: false,
        error: {
          kind: "cors",
          message: "This feed is still syncing. Wait a moment and try Test again.",
        },
      };
    }

    const payload = await fetchFeedCacheFile<BundledFeedFile>(file, true);
    if (!payload) {
      return {
        ok: false,
        error: { kind: "network", message: `Feed cache file missing: ${file}` },
      };
    }

    if (!Array.isArray(payload.jobs)) {
      return { ok: false, error: { kind: "parse", message: "Feed cache file is invalid." } };
    }

    return { ok: true, jobs: payload.jobs, syncedAt: payload.syncedAt ?? manifest.syncedAt };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: { kind: "unknown", message: msg } };
  }
}

export async function fetchBundledManifest(): Promise<BundledManifest | null> {
  return fetchBestFeedJson<BundledManifest>("manifest.json", true);
}
