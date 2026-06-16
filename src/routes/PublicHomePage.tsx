import React from "react";
import { Link } from "react-router-dom";
import { useFeedConfigs } from "../state/feedConfigs";
import { useJobsForFeeds } from "../state/jobs";
import { FeaturedJobsScroller } from "../components/FeaturedJobsScroller";
import { FeedTabsWidget } from "../components/FeedTabsWidget";
import { JobDirectoryWidget } from "../components/JobDirectoryWidget";
import { Button } from "../components/ui/Button";
import styles from "./PublicHomePage.module.css";

function buildErrorSummary(args: ReturnType<typeof useJobsForFeeds>): string | undefined {
  const lines: string[] = [];
  for (const f of args.activeFeeds) {
    const st = args.byFeed[f.id];
    if (st?.status === "error") lines.push(`${f.name}: ${st.error.message}`);
  }
  return lines.length ? lines.join("\n") : undefined;
}

export function PublicHomePage() {
  const { feeds } = useFeedConfigs();
  const jobsState = useJobsForFeeds(feeds);
  const errorMessage = buildErrorSummary(jobsState);
  const [selectedFeedId, setSelectedFeedId] = React.useState<string>("all");
  const isLoading = jobsState.activeFeeds.some((f) => jobsState.byFeed[f.id]?.status === "loading");

  return (
    <div className="container">
      <header className={styles.hero}>
        <div>
          <div className={styles.kicker}>Career Center Widgets</div>
          <h1 className={styles.title}>Discover opportunities, anywhere.</h1>
          <p className={styles.subtitle}>
            This is a fully static, GitHub Pages–hosted job widget system. Admins curate feeds; visitors browse a modern
            directory and embeddable widgets.
          </p>
          <div className={styles.actions}>
            <Link to="/admin">
              <Button type="button" variant="primary">
                Admin portal
              </Button>
            </Link>
            <a className={styles.secondaryLink} href="#/embed/all-jobs">
              Preview embed route
            </a>
          </div>
        </div>
        <div className={styles.heroCard}>
          <div className={styles.heroCardTitle}>Static-hosting notes</div>
          <ul className={styles.ul}>
            <li>Feeds must allow browser fetches (CORS) from your Pages origin.</li>
            <li>No backend, no database — configs persist in localStorage.</li>
            <li>Embeds are iframe-based for strong style isolation.</li>
          </ul>
        </div>
      </header>

      <main className={styles.main}>
        <FeaturedJobsScroller title="Featured jobs" jobs={jobsState.allJobs} isLoading={isLoading} errorMessage={errorMessage} />

        <div className={styles.section}>
          <JobDirectoryWidget
            title="All jobs directory"
            feeds={jobsState.activeFeeds}
            jobs={jobsState.allJobs}
            selectedFeedId={selectedFeedId}
            onSelectedFeedIdChange={setSelectedFeedId}
            isLoading={isLoading}
            errorMessage={errorMessage}
          />
        </div>

        <div className={styles.section}>
          <h2 className={styles.h2}>Feed tabs widget</h2>
          <FeedTabsWidget feeds={jobsState.activeFeeds} jobs={jobsState.allJobs} isLoading={isLoading} errorMessage={errorMessage} />
        </div>
      </main>

      <footer className={styles.footer}>
        <span>Built for GitHub Pages.</span>
        <span className={styles.dot} />
        <a href="#/embed/all-jobs">Embeds</a>
      </footer>
    </div>
  );
}

