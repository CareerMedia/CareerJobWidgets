import React from "react";
import { Link } from "react-router-dom";
import { useFeedConfigs } from "../state/feedConfigs";
import { useJobsForFeeds } from "../state/jobs";
import { JobDirectoryWidget } from "../components/JobDirectoryWidget";
import styles from "./JobsPage.module.css";

function buildErrorSummary(args: ReturnType<typeof useJobsForFeeds>): string | undefined {
  const lines: string[] = [];
  for (const f of args.activeFeeds) {
    const st = args.byFeed[f.id];
    if (st?.status === "error") lines.push(`${f.name}: ${st.error.message}`);
  }
  return lines.length ? lines.join("\n") : undefined;
}

export function JobsPage() {
  const { feeds } = useFeedConfigs();
  const jobsState = useJobsForFeeds(feeds);
  const [selectedFeedId, setSelectedFeedId] = React.useState("all");
  const isLoading = jobsState.activeFeeds.some((f) => jobsState.byFeed[f.id]?.status === "loading");
  const errorMessage = buildErrorSummary(jobsState);

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link className={styles.homeLink} to="/">
          ← Career Job Widgets
        </Link>
      </div>
      <JobDirectoryWidget
        title="Jobs"
        feeds={jobsState.activeFeeds}
        jobs={jobsState.allJobs}
        selectedFeedId={selectedFeedId}
        onSelectedFeedIdChange={setSelectedFeedId}
        isLoading={isLoading}
        errorMessage={errorMessage}
      />
    </div>
  );
}
