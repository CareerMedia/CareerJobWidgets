import React from "react";
import type { JobItem } from "../types/models";
import { excerptDescription, formatJobDate } from "../services/utils/text";
import styles from "./FeaturedJobCard.module.css";

function getEmployerInitials(employer?: string): string {
  if (!employer?.trim()) return "JO";
  const words = employer.trim().split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return `${words[0]![0] ?? ""}${words[1]![0] ?? ""}`.toUpperCase();
}

function openJob(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export function FeaturedJobCard(props: { job: JobItem }) {
  const { job } = props;
  const posted = formatJobDate(job.pubDate);
  const expires = formatJobDate(job.expiresAt);
  const excerpt = excerptDescription(job.description, 120);

  const onCardClick = () => openJob(job.applyUrl);
  const onCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openJob(job.applyUrl);
    }
  };

  return (
    <article
      className={styles.card}
      tabIndex={0}
      onClick={onCardClick}
      onKeyDown={onCardKeyDown}
      aria-label={`${job.title}${job.employer ? ` at ${job.employer}` : ""}`}
    >
      <div className={styles.inner}>
        <div className={styles.titleRow}>
          <div className={styles.initials} aria-hidden="true">
            {getEmployerInitials(job.employer)}
          </div>
          <div className={styles.titleBlock}>
            <h3 className={styles.title}>{job.title}</h3>
            {job.employer ? <p className={styles.employer}>{job.employer}</p> : null}
          </div>
        </div>

        <ul className={styles.meta}>
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
          {job.jobType ? (
            <li>
              <span className={styles.metaLabel}>Type</span> {job.jobType}
            </li>
          ) : null}
          {job.location ? (
            <li>
              <span className={styles.metaLabel}>Location</span> {job.location}
            </li>
          ) : null}
        </ul>

        {excerpt ? <p className={styles.excerpt}>{excerpt}</p> : null}

        <a
          className={styles.cta}
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          View Job <span aria-hidden="true">↗</span>
        </a>
      </div>
      <div className={styles.accent} aria-hidden="true" />
    </article>
  );
}
