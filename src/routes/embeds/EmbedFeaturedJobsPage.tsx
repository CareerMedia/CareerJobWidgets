import React from "react";
import { useFeedConfigs } from "../../state/feedConfigs";
import { useJobsForFeeds } from "../../state/jobs";
import { EmbedLayout } from "../../components/layout/EmbedLayout";
import { FeaturedJobsSection } from "../../components/FeaturedJobsSection";

export function EmbedFeaturedJobsPage() {
  const { feeds } = useFeedConfigs();
  const jobsState = useJobsForFeeds(feeds);

  const errorMessage = React.useMemo(() => {
    const lines: string[] = [];
    for (const f of jobsState.activeFeeds) {
      const st = jobsState.byFeed[f.id];
      if (st?.status === "error") lines.push(`${f.name}: ${st.error.message}`);
    }
    return lines.length ? lines.join("\n") : undefined;
  }, [jobsState.activeFeeds, jobsState.byFeed]);

  const isLoading = jobsState.activeFeeds.some((f) => jobsState.byFeed[f.id]?.status === "loading");

  return (
    <EmbedLayout variant="featured">
      <FeaturedJobsSection jobs={jobsState.allJobs} isLoading={isLoading} errorMessage={errorMessage} />
    </EmbedLayout>
  );
}
