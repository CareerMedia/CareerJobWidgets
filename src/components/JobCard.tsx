import React from "react";
import type { JobItem } from "../types/models";
import styles from "./JobCard.module.css";

export function JobCard(props: { job: JobItem }) {
  const { job } = props;
  const dateText = job.pubDate ? new Date(job.pubDate).toLocaleDateString() : undefined;

  return (
    <article className={styles.card}>
      <div className={styles.topRow}>
        <div className={styles.titleWrap}>
          <h3 className={styles.title}>{job.title}</h3>
          <div className={styles.meta}>
            {job.employer ? <span className={styles.employer}>{job.employer}</span> : null}
            <span className={styles.badge} aria-label={`Feed: ${job.feedName}`}>
              {job.feedName}
            </span>
            {dateText ? <span className={styles.date}>{dateText}</span> : null}
          </div>
        </div>
        <a
          className={styles.apply}
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open job: ${job.title}`}
        >
          View job
        </a>
      </div>

      {job.description ? <p className={styles.desc}>{job.description}</p> : null}
    </article>
  );
}

