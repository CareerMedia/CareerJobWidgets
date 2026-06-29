import type { SyncFeedPayload } from "../feeds/feedId";
import { fetchBestFeedJson, feedExistsInManifest } from "../feeds/feedDataSources";
import { dispatchWorkflow, waitForWorkflowSuccess } from "./githubApi";

const ADMIN_SAVE_WORKFLOW = "admin-save-feed.yml";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function saveFeedToRepo(action: "upsert" | "delete", feed: SyncFeedPayload, token: string): Promise<void> {
  const startedAt = new Date();
  await dispatchWorkflow(
    ADMIN_SAVE_WORKFLOW,
    {
      action,
      feed_json: JSON.stringify(feed),
    },
    token,
  );

  const result = await waitForWorkflowSuccess(ADMIN_SAVE_WORKFLOW, token, startedAt);
  if (result === "failure") {
    throw new Error("GitHub Actions failed while saving the feed. Check the Actions tab for details.");
  }
  if (result === "timeout") {
    throw new Error("Timed out waiting for GitHub Actions. Check the Actions tab — the feed may still save.");
  }
}

export async function waitForFeedInCache(feedId: string, timeoutMs = 120_000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const manifest = await fetchBestFeedJson<{ syncedAt?: string; idIndex?: Record<string, string>; feeds?: Record<string, unknown> }>(
        "manifest.json",
        true,
      );
      if (manifest && feedExistsInManifest(manifest, feedId)) return true;

      const config = await fetchBestFeedJson<{ syncedAt?: string; feeds?: Array<{ id: string }> }>(
        "feeds-config.json",
        true,
      );
      if (config?.feeds?.some((f) => f.id === feedId)) return true;
    } catch {
      // retry
    }
    await sleep(3000);
  }
  return false;
}
