import React from "react";
import type { FeedConfig, FeedFetchError, JobItem } from "../types/models";
import { fetchAndParseFeed } from "../services/feeds/feedService";

export type FeedJobsState =
  | { status: "unchecked" | "loading" }
  | { status: "working"; jobs: JobItem[] }
  | { status: "error"; error: FeedFetchError };

export type JobsByFeed = Record<string, FeedJobsState>;

export function useJobsForFeeds(feeds: FeedConfig[]) {
  const activeFeeds = React.useMemo(() => feeds.filter((f) => f.active), [feeds]);
  const [byFeed, setByFeed] = React.useState<JobsByFeed>({});

  const refresh = React.useCallback(async () => {
    const controller = new AbortController();
    const signal = controller.signal;
    setByFeed((prev) => {
      const next: JobsByFeed = { ...prev };
      for (const f of activeFeeds) next[f.id] = { status: "loading" };
      return next;
    });

    await Promise.all(
      activeFeeds.map(async (feed) => {
        const res = await fetchAndParseFeed(feed, signal);
        setByFeed((prev) => ({
          ...prev,
          [feed.id]: res.ok ? { status: "working", jobs: res.jobs } : { status: "error", error: res.error },
        }));
      }),
    );
  }, [activeFeeds]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const allJobs = React.useMemo(() => {
    const out: JobItem[] = [];
    for (const f of activeFeeds) {
      const state = byFeed[f.id];
      if (state?.status === "working") out.push(...state.jobs);
    }
    return out;
  }, [activeFeeds, byFeed]);

  return { byFeed, allJobs, refresh, activeFeeds };
}

