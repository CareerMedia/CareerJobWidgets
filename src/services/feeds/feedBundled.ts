import type { FeedConfig, FeedFetchError, JobItem } from "../../types/models";

type BundledManifest = {
  syncedAt?: string;
  urlIndex?: Record<string, string>;
  idIndex?: Record<string, string>;
};

type BundledFeedFile = {
  feedId: string;
  syncedAt?: string;
  jobs: JobItem[];
};

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
            "No bundled feed cache found on this site. For CORS-blocked feeds (like Handshake), run the feed sync step during deploy.",
        },
      };
    }

    const manifest = (await manifestRes.json()) as BundledManifest;
    const file = manifest.urlIndex?.[feed.url] ?? manifest.idIndex?.[feed.id];
    if (!file) {
      return {
        ok: false,
        error: {
          kind: "cors",
          message:
            "This feed blocks browser fetching (CORS), and it is not in the bundled cache yet. Add it to feeds.sync.json and redeploy.",
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
