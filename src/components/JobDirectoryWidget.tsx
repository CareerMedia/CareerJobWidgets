import React from "react";
import type { FeedConfig, JobItem } from "../types/models";
import { parseExpiresAt } from "../services/utils/text";
import { JobCard } from "./JobCard";
import { JobCardSkeleton } from "./JobCardSkeleton";
import styles from "./JobDirectoryWidget.module.css";

type SortOption = "newest" | "expiring" | "az";

function matches(job: JobItem, q: string): boolean {
  const query = q.trim().toLowerCase();
  if (!query) return true;
  const hay = [job.title, job.employer ?? "", job.description ?? "", job.location ?? "", job.feedName]
    .join(" ")
    .toLowerCase();
  return hay.includes(query);
}

function sortJobs(jobs: JobItem[], sort: SortOption): JobItem[] {
  const copy = [...jobs];
  switch (sort) {
    case "newest":
      return copy.sort((a, b) => Date.parse(b.pubDate ?? "") - Date.parse(a.pubDate ?? ""));
    case "expiring":
      return copy.sort((a, b) => {
        const ea = parseExpiresAt(a.expiresAt);
        const eb = parseExpiresAt(b.expiresAt);
        if (ea === undefined && eb === undefined) return 0;
        if (ea === undefined) return 1;
        if (eb === undefined) return -1;
        return ea - eb;
      });
    case "az":
      return copy.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));
    default:
      return copy;
  }
}

function SearchIcon() {
  return (
    <svg className={styles.searchIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M10.5 3a7.5 7.5 0 015.96 12.09l4.22 4.22-1.42 1.42-4.22-4.22A7.5 7.5 0 1110.5 3zm0 2a5.5 5.5 0 100 11 5.5 5.5 0 000-11z"
      />
    </svg>
  );
}

export function JobDirectoryWidget(props: {
  title?: string;
  feeds: FeedConfig[];
  jobs: JobItem[];
  selectedFeedId: string;
  onSelectedFeedIdChange: (id: string) => void;
  isLoading: boolean;
  errorMessage?: string;
  showFeedFilter?: boolean;
}) {
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<SortOption>("newest");
  const showFeedFilter = props.showFeedFilter !== false;

  const visibleJobs = React.useMemo(() => {
    const filtered = props.jobs
      .filter((j) => (props.selectedFeedId === "all" ? true : j.feedId === props.selectedFeedId))
      .filter((j) => matches(j, query));
    return sortJobs(filtered, sort);
  }, [props.jobs, props.selectedFeedId, query, sort]);

  const title = props.title ?? "Job Opportunities";
  const countLabel = props.isLoading
    ? "Loading jobs…"
    : `${visibleJobs.length.toLocaleString()} job${visibleJobs.length === 1 ? "" : "s"} found`;

  const feedChips = React.useMemo(
    () => [{ id: "all", name: "All Feeds" }, ...props.feeds.map((f) => ({ id: f.id, name: f.name }))],
    [props.feeds],
  );

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <section className={styles.wrap} aria-label={title}>
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>

        <form className={styles.searchRow} onSubmit={onSearchSubmit} role="search">
          <label className={styles.srOnly} htmlFor="job-directory-search">
            Search jobs
          </label>
          <div className={styles.searchField}>
            <SearchIcon />
            <input
              id="job-directory-search"
              className={styles.searchInput}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jobs"
              autoComplete="off"
            />
          </div>
          <button className={styles.searchBtn} type="submit">
            Search
          </button>
        </form>

        <div className={styles.toolbar}>
          <p className={styles.count} aria-live="polite">
            {countLabel}
          </p>

          <div className={styles.sortWrap}>
            <label className={styles.sortLabel} htmlFor="job-directory-sort">
              Sort by
            </label>
            <select
              id="job-directory-sort"
              className={styles.sortSelect}
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
            >
              <option value="newest">Newest first</option>
              <option value="expiring">Expiring soon</option>
              <option value="az">A–Z</option>
            </select>
          </div>
        </div>

        {showFeedFilter && props.feeds.length > 0 ? (
          <div className={styles.chips} role="tablist" aria-label="Filter by feed">
            {feedChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                role="tab"
                aria-selected={props.selectedFeedId === chip.id}
                className={[styles.chip, props.selectedFeedId === chip.id ? styles.chipActive : ""]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => props.onSelectedFeedIdChange(chip.id)}
              >
                {chip.name}
              </button>
            ))}
          </div>
        ) : null}
      </header>

      {props.errorMessage ? (
        <div className={styles.alert} role="alert">
          <strong>Some feeds could not be loaded.</strong>
          <p className={styles.alertBody}>{props.errorMessage}</p>
        </div>
      ) : null}

      {props.isLoading ? (
        <div className={styles.grid} aria-busy="true" aria-label="Loading jobs">
          {Array.from({ length: 6 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : visibleJobs.length === 0 ? (
        <div className={styles.empty}>
          <p>No jobs found. Try adjusting your search or filters.</p>
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
