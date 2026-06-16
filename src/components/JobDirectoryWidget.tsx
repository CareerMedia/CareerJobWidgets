import React from "react";
import type { FeedConfig, JobItem } from "../types/models";
import { JobCard } from "./JobCard";
import { SearchBar } from "./SearchBar";
import { FeedFilter } from "./FeedFilter";
import styles from "./JobDirectoryWidget.module.css";

function matches(job: JobItem, q: string): boolean {
  const query = q.trim().toLowerCase();
  if (!query) return true;
  const hay = [
    job.title,
    job.employer ?? "",
    job.description ?? "",
    job.location ?? "",
    job.feedName,
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(query);
}

function sortNewestFirst(a: JobItem, b: JobItem): number {
  const ta = a.pubDate ? Date.parse(a.pubDate) : 0;
  const tb = b.pubDate ? Date.parse(b.pubDate) : 0;
  return tb - ta;
}

export function JobDirectoryWidget(props: {
  title: string;
  feeds: FeedConfig[];
  jobs: JobItem[];
  selectedFeedId: string;
  onSelectedFeedIdChange: (id: string) => void;
  isLoading: boolean;
  errorMessage?: string;
}) {
  const [query, setQuery] = React.useState("");

  const visibleJobs = React.useMemo(() => {
    const filtered = props.jobs
      .filter((j) => (props.selectedFeedId === "all" ? true : j.feedId === props.selectedFeedId))
      .filter((j) => matches(j, query))
      .slice()
      .sort(sortNewestFirst);
    return filtered;
  }, [props.jobs, props.selectedFeedId, query]);

  return (
    <section className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>{props.title}</h2>
          <p className={styles.sub}>
            {props.isLoading ? "Loading feeds…" : `${visibleJobs.length.toLocaleString()} jobs`}
          </p>
        </div>
        <div className={styles.controls}>
          <FeedFilter feeds={props.feeds} value={props.selectedFeedId} onChange={props.onSelectedFeedIdChange} />
          <SearchBar value={query} onChange={setQuery} />
        </div>
      </header>

      {props.errorMessage ? (
        <div className={styles.state} role="alert">
          <strong>Some feeds couldn’t be loaded.</strong>
          <div className={styles.stateBody}>{props.errorMessage}</div>
        </div>
      ) : null}

      {props.isLoading ? (
        <div className={styles.state}>Loading jobs…</div>
      ) : visibleJobs.length === 0 ? (
        <div className={styles.state}>
          No jobs match your search yet. If feeds are failing due to CORS, try a CORS-enabled source.
        </div>
      ) : (
        <div className={styles.grid}>
          {visibleJobs.map((job) => (
            <JobCard key={`${job.feedId}:${job.id}`} job={job} />
          ))}
        </div>
      )}
    </section>
  );
}

