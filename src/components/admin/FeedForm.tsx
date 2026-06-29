import React from "react";
import type { FeedConfig } from "../../types/models";
import { deriveFeedType } from "../../services/feeds/feedId";
import { isHandshakeFeedUrl } from "../../services/feeds/feedUrl";
import { Button } from "../ui/Button";
import styles from "./FeedForm.module.css";

export function FeedForm(props: {
  value: FeedConfig;
  onChange: (next: FeedConfig) => void;
  onSave: () => void | Promise<void>;
  onCancel?: () => void;
  saving?: boolean;
}) {
  const set = <K extends keyof FeedConfig>(key: K, val: FeedConfig[K]) => props.onChange({ ...props.value, [key]: val });

  const isNew = /^feed_/.test(props.value.id);
  const detectedType = props.value.url.trim() ? deriveFeedType(props.value.url) : "auto";
  const needsServerSync =
    props.value.url.trim() && (isHandshakeFeedUrl(props.value.url) || detectedType !== "json");

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        void props.onSave();
      }}
    >
      <label className={styles.label}>
        Feed name
        <input className={styles.input} value={props.value.name} onChange={(e) => set("name", e.target.value)} required />
      </label>

      <label className={styles.label}>
        Feed URL
        <input
          className={styles.input}
          value={props.value.url}
          onChange={(e) => set("url", e.target.value)}
          placeholder="https://…"
          required
        />
      </label>

      {props.value.url.trim() ? (
        <p className={styles.hint}>
          Type: <strong>{detectedType}</strong>
          {needsServerSync ? " — will be synced automatically via GitHub Actions." : " — loads directly in the browser."}
        </p>
      ) : (
        <p className={styles.hint}>Paste the RSS or JSON feed link. Type and sync are handled automatically.</p>
      )}

      {!isNew ? (
        <label className={styles.label}>
          Active
          <select
            className={styles.input}
            value={props.value.active ? "yes" : "no"}
            onChange={(e) => set("active", e.target.value === "yes")}
          >
            <option value="yes">Enabled</option>
            <option value="no">Disabled</option>
          </select>
        </label>
      ) : null}

      <details className={styles.advanced}>
        <summary>Optional details</summary>
        <div className={styles.advancedBody}>
          <label className={styles.label}>
            Category / label
            <input
              className={styles.input}
              value={props.value.category ?? ""}
              onChange={(e) => set("category", e.target.value)}
            />
          </label>
          <label className={styles.label}>
            Description
            <textarea
              className={styles.textarea}
              value={props.value.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
            />
          </label>
        </div>
      </details>

      <div className={styles.actions}>
        <Button type="submit" disabled={props.saving}>
          {props.saving ? "Saving…" : "Save feed"}
        </Button>
        {props.onCancel ? (
          <Button type="button" variant="ghost" onClick={props.onCancel} disabled={props.saving}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
