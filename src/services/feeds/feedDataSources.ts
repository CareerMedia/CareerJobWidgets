import { GITHUB_RAW_FEEDS_BASE } from "../../config/appConfig";

export function pagesFeedsBase(): string {
  const base = import.meta.env.BASE_URL;
  return `${base}data/feeds`;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Fetch JSON from repo (main branch) and deployed Pages; return the freshest copy. */
export async function fetchBestFeedJson<T extends { syncedAt?: string }>(
  fileName: string,
  cacheBust = false,
): Promise<T | null> {
  const suffix = cacheBust ? `?t=${Date.now()}` : "";
  const repoUrl = `${GITHUB_RAW_FEEDS_BASE}/${fileName}${suffix}`;
  const pagesUrl = `${pagesFeedsBase()}/${fileName}${suffix}`;

  const fromRepo = await fetchJson<T>(repoUrl);
  const fromPages = await fetchJson<T>(pagesUrl);
  const candidates: T[] = [];
  if (fromRepo) candidates.push(fromRepo);
  if (fromPages) candidates.push(fromPages);
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0] ?? null;

  const sorted = candidates.sort(
    (a, b) => new Date(b.syncedAt ?? 0).getTime() - new Date(a.syncedAt ?? 0).getTime(),
  );
  return sorted[0] ?? null;
}

/** Fetch a feed cache file — prefer repo (updates immediately after admin save). */
export async function fetchFeedCacheFile<T>(fileName: string, cacheBust = false): Promise<T | null> {
  const suffix = cacheBust ? `?t=${Date.now()}` : "";
  for (const base of [GITHUB_RAW_FEEDS_BASE, pagesFeedsBase()]) {
    const data = await fetchJson<T>(`${base}/${fileName}${suffix}`);
    if (data) return data;
  }
  return null;
}

export function feedExistsInManifest(
  manifest: { idIndex?: Record<string, string>; feeds?: Record<string, unknown> },
  feedId: string,
): boolean {
  return Boolean(manifest.idIndex?.[feedId] || manifest.feeds?.[feedId]);
}
