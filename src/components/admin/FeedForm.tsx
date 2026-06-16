import React from "react";
import type { FeedConfig, FeedType } from "../../types/models";
import { Button } from "../ui/Button";
import styles from "./FeedForm.module.css";

export function FeedForm(props: {
  value: FeedConfig;
  onChange: (next: FeedConfig) => void;
  onSave: () => void;
  onCancel?: () => void;
}) {
  const set = <K extends keyof FeedConfig>(key: K, val: FeedConfig[K]) => props.onChange({ ...props.value, [key]: val });

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        props.onSave();
      }}
    >
      <div className={styles.row}>
        <label className={styles.label}>
          Feed name
          <input className={styles.input} value={props.value.name} onChange={(e) => set("name", e.target.value)} required />
        </label>
        <label className={styles.label}>
          Type
          <select
            className={styles.input}
            value={props.value.type}
            onChange={(e) => set("type", e.target.value as FeedType)}
          >
            <option value="auto">Auto detect</option>
            <option value="rss">RSS</option>
            <option value="json">JSON</option>
          </select>
        </label>
      </div>

      <label className={styles.label}>
        Feed URL
        <input className={styles.input} value={props.value.url} onChange={(e) => set("url", e.target.value)} required />
      </label>

      <div className={styles.row}>
        <label className={styles.label}>
          Category / label
          <input className={styles.input} value={props.value.category ?? ""} onChange={(e) => set("category", e.target.value)} />
        </label>
        <label className={styles.label}>
          Active
          <select className={styles.input} value={props.value.active ? "yes" : "no"} onChange={(e) => set("active", e.target.value === "yes")}>
            <option value="yes">Enabled</option>
            <option value="no">Disabled</option>
          </select>
        </label>
      </div>

      <label className={styles.label}>
        Description
        <textarea className={styles.textarea} value={props.value.description ?? ""} onChange={(e) => set("description", e.target.value)} rows={3} />
      </label>

      <div className={styles.actions}>
        <Button type="submit">Save feed</Button>
        {props.onCancel ? (
          <Button type="button" variant="ghost" onClick={props.onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

