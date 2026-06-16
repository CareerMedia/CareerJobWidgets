/** Normalize feed URLs so admin copies and sync config entries still match. */
export function normalizeFeedUrl(url: string): string {
  try {
    const u = new URL(url.trim());
    u.hash = "";
    return u.href;
  } catch {
    return url.trim();
  }
}

/** Handshake external feeds are keyed by numeric feed id in the path. */
export function handshakeFeedKey(url: string): string | undefined {
  const m = url.match(/external_feeds\/(\d+)/i);
  return m?.[1] ? `handshake_feed_${m[1]}` : undefined;
}

export function isHandshakeFeedUrl(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith("joinhandshake.com");
  } catch {
    return false;
  }
}
