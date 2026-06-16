import React from "react";
import { useParams } from "react-router-dom";
import { useFeedConfigs } from "../../state/feedConfigs";
import { useJobsForFeeds } from "../../state/jobs";
import { EmbedLayout } from "../../components/layout/EmbedLayout";
import { FeaturedJobsSection } from "../../components/FeaturedJobsSection";

export function EmbedFeedFeaturedPage() {
  const { feedId } = useParams();
  const { feeds } = useFeedConfigs();
  const jobsState = useJobsForFeeds(feeds);

  const feed = jobsState.activeFeeds.find((f) => f.id === feedId);
  const jobs = feed ? jobsState.allJobs.filter((j) => j.feedId === feed.id) : [];

  const errorMessage = React.useMemo(() => {
    if (!feed) return feedId ? `Feed not found: ${feedId}` : "Feed not found.";
    const st = jobsState.byFeed[feed.id];
    return st?.status === "error" ? st.error.message : undefined;
  }, [feed, feedId, jobsState.byFeed]);

  const isLoading = feed ? jobsState.byFeed[feed.id]?.status === "loading" : false;

  return (
    <EmbedLayout variant="featured">
      <FeaturedJobsSection
        jobs={jobs}
        feedId={feed?.id}
        title={feed ? `${feed.name} — Featured Jobs` : "Available Jobs & Internships"}
        isLoading={Boolean(isLoading)}
        errorMessage={errorMessage}
      />
    </EmbedLayout>
  );
}
