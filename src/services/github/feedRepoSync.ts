import type { SyncFeedPayload } from "../feeds/feedId";
import { dispatchWorkflow } from "./githubApi";

const ADMIN_SAVE_WORKFLOW = "admin-save-feed.yml";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function saveFeedToRepo(action: "upsert" | "delete", feed: SyncFeedPayload, token: string): Promise<void> {
  await dispatchWorkflow(
    ADMIN_SAVE_WORKFLOW,
    {
      action,
      feed_json: JSON.stringify(feed),
    },
    token,
  );
}

export async function waitForFeedInCache(feedId: string, timeoutMs = 180_000): Promise<boolean> {
  const base = import.meta.env.BASE_URL;
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${base}data/feeds/manifest.json?t=${Date.now()}`);
      if (res.ok) {
        const manifest = (await res.json()) as {
          idIndex?: Record<string, string>;
          feeds?: Record<string, unknown>;
        };
        if (manifest.idIndex?.[feedId] || manifest.feeds?.[feedId]) return true;
      }
    } catch {
      // retry
    }
    await sleep(4000);
  }
  return false;
}
