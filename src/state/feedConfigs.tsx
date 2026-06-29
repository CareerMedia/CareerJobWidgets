import React from "react";
import type { FeedConfig } from "../types/models";
import { feedStorage } from "../services/storage/feedStorage";
import { createId } from "../services/utils/ids";
import { loadBundledFeedConfigs } from "../services/feeds/bundledFeedConfig";
import { finalizeFeedConfig, toSyncPayload } from "../services/feeds/feedId";
import { saveFeedToRepo, waitForFeedInCache } from "../services/github/feedRepoSync";
import { githubTokenStorage } from "../services/github/githubTokenStorage";
import { GitHubApiError } from "../services/github/githubApi";

export type FeedSyncState = {
  busy: boolean;
  message?: string;
  error?: string;
};

type Ctx = {
  feeds: FeedConfig[];
  loading: boolean;
  syncState: FeedSyncState;
  refreshFeeds: () => Promise<void>;
  upsertFeed: (feed: FeedConfig) => Promise<void>;
  deleteFeed: (id: string) => Promise<void>;
  exportJson: () => string;
  importJson: (jsonText: string) => void;
  createNewFeed: () => FeedConfig;
};

const FeedConfigsContext = React.createContext<Ctx | null>(null);

export function FeedConfigsProvider(props: { children: React.ReactNode }) {
  const [feeds, setFeedsState] = React.useState<FeedConfig[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [syncState, setSyncState] = React.useState<FeedSyncState>({ busy: false });

  const refreshFeeds = React.useCallback(async () => {
    const bundled = await loadBundledFeedConfigs(true);
    if (bundled.length > 0) {
      setFeedsState(bundled);
      feedStorage.save(bundled);
      return;
    }
    const local = feedStorage.load();
    setFeedsState(local);
  }, []);

  React.useEffect(() => {
    void refreshFeeds().finally(() => setLoading(false));
  }, [refreshFeeds]);

  const applyLocal = React.useCallback((next: FeedConfig[]) => {
    setFeedsState(next);
    feedStorage.save(next);
  }, []);

  const syncToRepo = React.useCallback(
    async (action: "upsert" | "delete", feed: FeedConfig) => {
      const token = githubTokenStorage.load();
      if (!token) {
        throw new GitHubApiError(
          "Connect GitHub in the admin panel first. Feeds are saved to the repo so they sync across devices.",
        );
      }

      setSyncState({ busy: true, message: action === "delete" ? "Removing feed…" : "Saving feed to GitHub…" });
      try {
        await saveFeedToRepo(action, toSyncPayload(feed), token);
        setSyncState({ busy: true, message: "Syncing feed data (this takes about a minute)…" });
        const ready = await waitForFeedInCache(feed.id);
        await refreshFeeds();
        if (!ready && action === "upsert" && feed.active) {
          setSyncState({
            busy: false,
            message: "Feed saved. Job data is still syncing — refresh in a minute if jobs don’t appear yet.",
          });
          return;
        }
        setSyncState({ busy: false, message: action === "delete" ? "Feed removed." : "Feed saved and synced." });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to save feed.";
        setSyncState({ busy: false, error: msg });
        throw err;
      }
    },
    [refreshFeeds],
  );

  const upsertFeed = React.useCallback(
    async (feed: FeedConfig) => {
      const isNew = !feeds.some((f) => f.id === feed.id);
      const finalized = finalizeFeedConfig(feed, isNew);
      const next = isNew
        ? [...feeds, finalized]
        : feeds.map((f) => (f.id === finalized.id ? finalized : f));
      applyLocal(next);
      await syncToRepo("upsert", finalized);
    },
    [feeds, applyLocal, syncToRepo],
  );

  const deleteFeed = React.useCallback(
    async (id: string) => {
      const feed = feeds.find((f) => f.id === id);
      if (!feed) return;
      applyLocal(feeds.filter((f) => f.id !== id));
      await syncToRepo("delete", feed);
    },
    [feeds, applyLocal, syncToRepo],
  );

  const exportJson = React.useCallback(() => feedStorage.exportJson(), []);

  const importJson = React.useCallback(
    (jsonText: string) => {
      const next = feedStorage.importJson(jsonText);
      applyLocal(next);
    },
    [applyLocal],
  );

  const createNewFeed = React.useCallback((): FeedConfig => {
    const now = new Date().toISOString();
    return {
      id: createId("feed"),
      name: "",
      url: "",
      type: "auto",
      description: "",
      category: "",
      active: true,
      createdAt: now,
      updatedAt: now,
    };
  }, []);

  const value: Ctx = {
    feeds,
    loading,
    syncState,
    refreshFeeds,
    upsertFeed,
    deleteFeed,
    exportJson,
    importJson,
    createNewFeed,
  };
  return <FeedConfigsContext.Provider value={value}>{props.children}</FeedConfigsContext.Provider>;
}

export function useFeedConfigs(): Ctx {
  const ctx = React.useContext(FeedConfigsContext);
  if (!ctx) throw new Error("useFeedConfigs must be used within FeedConfigsProvider");
  return ctx;
}
