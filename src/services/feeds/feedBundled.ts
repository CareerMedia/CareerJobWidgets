import type { FeedConfig, FeedFetchError, JobItem } from "../../types/models";
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

  // Last resort: match any manifest feed with the same Handshake external_feeds id.
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
 * GitHub Pages note:
 * Handshake and many RSS hosts do not send CORS headers. Browsers cannot fetch them directly.
 * We ship a same-origin JSON cache generated at build time (see scripts/sync-feeds.mjs).
 */
export async function fetchBundledJobs(
  feed: FeedConfig,
): Promise<{ ok: true; jobs: JobItem[]; syncedAt?: string } | { ok: false; error: FeedFetchError }> {
  const base = import.meta.env.BASE_URL;
  try {
    const manifestRes = await fetch(`${base}data/feeds/manifest.json`);
    if (!manifestRes.ok) {
      return {
        ok: false,
        error: {
          kind: "network",
          message:
            "No bundled feed cache found on this site. Run the Sync Feeds GitHub Action or redeploy after adding the feed to feeds.sync.json.",
        },
      };
    }

    const manifest = (await manifestRes.json()) as BundledManifest;
    const file = resolveCacheFile(manifest, feed);
    if (!file) {
      return {
        ok: false,
        error: {
          kind: "cors",
          message:
            "This feed is still syncing. Wait about a minute after saving, then refresh. If it persists, check GitHub Actions.",
        },
      };
    }

    const jobsRes = await fetch(`${base}data/feeds/${file}`);
    if (!jobsRes.ok) {
      return {
        ok: false,
        error: { kind: "network", message: `Bundled cache file missing: ${file}` },
      };
    }

    const payload = (await jobsRes.json()) as BundledFeedFile;
    if (!Array.isArray(payload.jobs)) {
      return { ok: false, error: { kind: "parse", message: "Bundled cache file is invalid." } };
    }

    return { ok: true, jobs: payload.jobs, syncedAt: payload.syncedAt ?? manifest.syncedAt };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: { kind: "unknown", message: msg } };
  }
}

export async function fetchBundledManifest(): Promise<BundledManifest | null> {
  const base = import.meta.env.BASE_URL;
  try {
    const res = await fetch(`${base}data/feeds/manifest.json`);
    if (!res.ok) return null;
    return (await res.json()) as BundledManifest;
  } catch {
    return null;
  }
}
