import React from "react";
import type { FeedConfig, FeedFetchError, FeedCheckStatus } from "../../types/models";
import { Button } from "../ui/Button";
import { FeedStatusBadge } from "./FeedStatusBadge";
import styles from "./FeedList.module.css";

export function FeedList(props: {
  feeds: FeedConfig[];
  statusById: Record<string, { status: FeedCheckStatus; error?: FeedFetchError }>;
  onEdit: (feed: FeedConfig) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  onTest: (feed: FeedConfig) => void;
  onCopyDirectoryEmbed: (feed: FeedConfig) => void;
  onCopyFeaturedEmbed: (feed: FeedConfig) => void;
  onPreviewDirectory: (feed: FeedConfig) => void;
  onPreviewFeatured: (feed: FeedConfig) => void;
}) {
  if (props.feeds.length === 0) {
    return <div className={styles.empty}>No feeds yet. Add one to begin.</div>;
  }

  return (
    <div className={styles.list}>
      {props.feeds.map((f) => {
        const st = props.statusById[f.id] ?? { status: "unchecked" as const };
        return (
          <div key={f.id} className={styles.item}>
            <div className={styles.left}>
              <div className={styles.nameRow}>
                <div className={styles.name}>{f.name}</div>
                <FeedStatusBadge status={st.status} />
                {!f.active ? <span className={styles.disabled}>Disabled</span> : null}
              </div>
              <div className={styles.url}>{f.url}</div>
              {st.status === "error" ? <div className={styles.error}>Error: {st.error?.message}</div> : null}
            </div>

            <div className={styles.actions}>
              <Button type="button" variant="ghost" onClick={() => props.onEdit(f)}>
                Edit
              </Button>
              <Button type="button" variant="ghost" onClick={() => props.onToggleActive(f.id)}>
                {f.active ? "Disable" : "Enable"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => props.onTest(f)}>
                Test
              </Button>
              <Button type="button" variant="ghost" onClick={() => props.onPreviewDirectory(f)}>
                Preview directory
              </Button>
              <Button type="button" variant="ghost" onClick={() => props.onPreviewFeatured(f)}>
                Preview featured
              </Button>
              <Button type="button" variant="ghost" onClick={() => props.onCopyDirectoryEmbed(f)}>
                Copy directory embed
              </Button>
              <Button type="button" variant="ghost" onClick={() => props.onCopyFeaturedEmbed(f)}>
                Copy featured embed
              </Button>
              <Button type="button" variant="danger" onClick={() => props.onDelete(f.id)}>
                Delete
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

