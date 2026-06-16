import React from "react";
import type { JobItem } from "../types/models";
import { excerptDescription, formatJobDate } from "../services/utils/text";
import styles from "./JobCard.module.css";

function openJobUrl(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export function JobCard(props: { job: JobItem }) {
  const { job } = props;
  const posted = formatJobDate(job.pubDate);
  const expires = formatJobDate(job.expiresAt);
  const excerpt = excerptDescription(job.description, 180);

  const onCardClick = () => openJobUrl(job.applyUrl);
  const onCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openJobUrl(job.applyUrl);
    }
  };

  return (
    <article
      className={styles.card}
      tabIndex={0}
      role="group"
      aria-label={`${job.title}${job.employer ? ` at ${job.employer}` : ""}`}
      onClick={onCardClick}
      onKeyDown={onCardKeyDown}
    >
      <div className={styles.accent} aria-hidden="true" />

      <div className={styles.body}>
        <h3 className={styles.title}>{job.title}</h3>
        {job.employer ? <p className={styles.employer}>{job.employer}</p> : null}

        <ul className={styles.metaList}>
          {posted ? (
            <li>
              <span className={styles.metaLabel}>Posted</span> {posted}
            </li>
          ) : null}
          {expires ? (
            <li className={styles.expires}>
              <span className={styles.metaLabel}>Expires</span> {expires}
            </li>
          ) : null}
          {job.location ? (
            <li>
              <span className={styles.metaLabel}>Location</span> {job.location}
            </li>
          ) : null}
          {job.jobType ? (
            <li>
              <span className={styles.metaLabel}>Type</span> {job.jobType}
            </li>
          ) : null}
        </ul>

        {excerpt ? <p className={styles.excerpt}>{excerpt}</p> : null}
      </div>

      <a
        className={styles.applyBtn}
        href={job.applyUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View more and apply for ${job.title}`}
        onClick={(e) => e.stopPropagation()}
      >
        View More and Apply
        <span className={styles.external} aria-hidden="true">
          ↗
        </span>
      </a>
    </article>
  );
}
