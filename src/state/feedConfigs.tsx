import React from "react";
import type { FeedConfig } from "../types/models";
import { feedStorage } from "../services/storage/feedStorage";
import { createId } from "../services/utils/ids";

const DEFAULT_FEEDS: FeedConfig[] = [
  {
    id: "csun_amc_handshake",
    name: "Mike Curb College of Arts, Media, & Communication",
    url: "https://csun.joinhandshake.com/external_feeds/26754/public.rss?token=n9iGisvAtXtehJcIWugM6l7fhrB0uCybdZCduhyKr5_tDBIPt2OcYA",
    type: "rss",
    description: "CSUN Handshake feed (loaded from build-time cache on GitHub Pages due to CORS).",
    category: "CSUN / CAM",
    active: true,
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

