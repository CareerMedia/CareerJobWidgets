import React from "react";
import type { FeedConfig } from "../types/models";
import styles from "./FeedFilter.module.css";

export function FeedFilter(props: {
  feeds: FeedConfig[];
  value: string;
  onChange: (feedId: string) => void;
  label?: string;
}) {
  const id = React.useId();
  return (
    <div className={styles.wrap}>
      <label className={styles.label} htmlFor={id}>
        {props.label ?? "Feed"}
      </label>
      <select id={id} className={styles.select} value={props.value} onChange={(e) => props.onChange(e.target.value)}>
        <option value="all">All feeds</option>
        {props.feeds.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
    </div>
  );
}

