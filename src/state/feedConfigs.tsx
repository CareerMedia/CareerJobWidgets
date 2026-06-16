import React from "react";
import type { FeedConfig } from "../types/models";
import { feedStorage } from "../services/storage/feedStorage";
import { createId } from "../services/utils/ids";

const DEFAULT_FEEDS: FeedConfig[] = [
  {
    id: "demo_rss",
    name: "Demo RSS (replace me)",
    url: "https://example.com/jobs.rss",
    type: "rss",
    description: "A placeholder RSS feed URL. Replace with a real CORS-enabled feed.",
    category: "Demo",
    active: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "demo_json",
    name: "Demo JSON (replace me)",
    url: "https://example.com/jobs.json",
    type: "json",
    description: "A placeholder JSON feed URL. Replace with a real CORS-enabled feed.",
    category: "Demo",
    active: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

type Ctx = {
  feeds: FeedConfig[];
  setFeeds: (next: FeedConfig[]) => void;
  upsertFeed: (
    feed: Omit<FeedConfig, "createdAt" | "updatedAt"> &
      Partial<Pick<FeedConfig, "createdAt" | "updatedAt">>,
  ) => void;
  deleteFeed: (id: string) => void;
  exportJson: () => string;
  importJson: (jsonText: string) => void;
  createNewFeed: () => FeedConfig;
};

const FeedConfigsContext = React.createContext<Ctx | null>(null);

export function FeedConfigsProvider(props: { children: React.ReactNode }) {
  const [feeds, setFeedsState] = React.useState<FeedConfig[]>(() => {
    const loaded = feedStorage.load();
    if (loaded.length > 0) return loaded;
    feedStorage.save(DEFAULT_FEEDS);
    return DEFAULT_FEEDS;
  });

  const setFeeds = React.useCallback((next: FeedConfig[]) => {
    setFeedsState(next);
    feedStorage.save(next);
  }, []);

  const upsertFeed = React.useCallback(
    (
      feed: Omit<FeedConfig, "createdAt" | "updatedAt"> &
        Partial<Pick<FeedConfig, "createdAt" | "updatedAt">>,
    ) => {
      const now = new Date().toISOString();
      setFeeds(
        feeds.some((f) => f.id === feed.id)
          ? feeds.map((f) => (f.id === feed.id ? { ...f, ...feed, updatedAt: now } : f))
          : [
              ...feeds,
              {
                ...(feed as FeedConfig),
                createdAt: feed.createdAt ?? now,
                updatedAt: feed.updatedAt ?? now,
              },
            ],
      );
    },
    [feeds, setFeeds],
  );

  const deleteFeed = React.useCallback(
    (id: string) => {
      setFeeds(feeds.filter((f) => f.id !== id));
    },
    [feeds, setFeeds],
  );

  const exportJson = React.useCallback(() => feedStorage.exportJson(), []);

  const importJson = React.useCallback(
    (jsonText: string) => {
      const next = feedStorage.importJson(jsonText);
      setFeeds(next);
    },
    [setFeeds],
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

  const value: Ctx = { feeds, setFeeds, upsertFeed, deleteFeed, exportJson, importJson, createNewFeed };
  return <FeedConfigsContext.Provider value={value}>{props.children}</FeedConfigsContext.Provider>;
}

export function useFeedConfigs(): Ctx {
  const ctx = React.useContext(FeedConfigsContext);
  if (!ctx) throw new Error("useFeedConfigs must be used within FeedConfigsProvider");
  return ctx;
}

