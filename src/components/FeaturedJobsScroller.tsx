import React from "react";
import type { JobItem } from "../types/models";
import styles from "./FeaturedJobsScroller.module.css";

export function FeaturedJobsScroller(props: {
  title: string;
  jobs: JobItem[];
  isLoading: boolean;
  errorMessage?: string;
}) {
  const items = React.useMemo(() => props.jobs.slice(0, 18), [props.jobs]);
  return (
    <section className={styles.wrap}>
      <header className={styles.header}>
        <h2 className={styles.title}>{props.title}</h2>
        <p className={styles.sub}>{props.isLoading ? "Loading…" : "Featured opportunities"}</p>
      </header>

      {props.errorMessage ? (
        <div className={styles.state} role="alert">
          <strong>Some feeds couldn’t be loaded.</strong> {props.errorMessage}
        </div>
      ) : null}

      {props.isLoading ? (
        <div className={styles.state}>Loading featured jobs…</div>
      ) : items.length === 0 ? (
        <div className={styles.state}>No featured jobs yet.</div>
      ) : (
        <div className={styles.row} role="list">
          {items.map((job) => (
            <a
              key={`${job.feedId}:${job.id}`}
              className={styles.item}
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              role="listitem"
              aria-label={`Open job: ${job.title}`}
            >
              <div className={styles.badge}>{job.feedName}</div>
              <div className={styles.jobTitle}>{job.title}</div>
              {job.employer ? <div className={styles.employer}>{job.employer}</div> : null}
              {job.location ? <div className={styles.meta}>{job.location}</div> : null}
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

