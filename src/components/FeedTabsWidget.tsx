import React from "react";
import type { FeedConfig, JobItem } from "../types/models";
import styles from "./FeedTabsWidget.module.css";
import { JobDirectoryWidget } from "./JobDirectoryWidget";

export function FeedTabsWidget(props: {
  feeds: FeedConfig[];
  jobs: JobItem[];
  isLoading: boolean;
  errorMessage?: string;
}) {
  const [selected, setSelected] = React.useState<string>("all");
  const activeFeeds = props.feeds;

  const chips = React.useMemo(() => [{ id: "all", name: "All feeds" }, ...activeFeeds.map((f) => ({ id: f.id, name: f.name }))], [activeFeeds]);

  return (
    <section className={styles.wrap}>
      <div className={styles.chips} role="tablist" aria-label="Feed tabs">
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            className={[styles.chip, selected === c.id ? styles.active : ""].filter(Boolean).join(" ")}
            onClick={() => setSelected(c.id)}
            role="tab"
            aria-selected={selected === c.id}
          >
            {c.name}
          </button>
        ))}
      </div>

      <JobDirectoryWidget
        title="Jobs"
        feeds={activeFeeds}
        jobs={props.jobs}
        selectedFeedId={selected}
        onSelectedFeedIdChange={setSelected}
        isLoading={props.isLoading}
        errorMessage={props.errorMessage}
        showFeedFilter={false}
      />
    </section>
  );
}

