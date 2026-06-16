import React from "react";
import { SYNC_FEEDS_WORKFLOW_URL } from "../../config/appConfig";
import { fetchBundledManifest } from "../../services/feeds/feedBundled";
import { Button } from "../ui/Button";
import styles from "./FeedSyncPanel.module.css";

export function FeedSyncPanel() {
  const [manifest, setManifest] = React.useState<Awaited<ReturnType<typeof fetchBundledManifest>>>(null);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setManifest(await fetchBundledManifest());
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const syncedLabel = manifest?.syncedAt
    ? new Date(manifest.syncedAt).toLocaleString()
    : loading
      ? "Loading…"
      : "Never";

  const feedSummaries = manifest?.feeds ? Object.entries(manifest.feeds) : [];

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Feed sync (Handshake / CORS-blocked feeds)</h2>
          <p className={styles.micro}>
            Handshake RSS feeds cannot be fetched directly in the browser. A GitHub Action pulls them server-side and
            saves JSON to <code>public/data/feeds/</code> in this repo. The site loads that cache automatically.
          </p>
        </div>
        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={() => void refresh()}>
            Refresh status
          </Button>
          <a className={styles.syncBtn} href={SYNC_FEEDS_WORKFLOW_URL} target="_blank" rel="noopener noreferrer">
            Sync feeds now
          </a>
        </div>
      </div>

      <div className={styles.meta}>
        <div>
          <span className={styles.label}>Last synced</span>
          <span className={styles.value}>{syncedLabel}</span>
        </div>
        <div>
          <span className={styles.label}>Cached feeds</span>
          <span className={styles.value}>{feedSummaries.length}</span>
        </div>
      </div>

      {feedSummaries.length > 0 ? (
        <ul className={styles.list}>
          {feedSummaries.map(([id, info]) => (
            <li key={id}>
              <strong>{id}</strong> — {info.jobCount} jobs
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.micro}>
          No cached feeds found yet. Add feeds to <code>feeds.sync.json</code>, then click <strong>Sync feeds now</strong>{" "}
          and run the workflow.
        </p>
      )}

      <p className={styles.hint}>
        After syncing, GitHub Actions commits the JSON and redeploys the site. Daily sync runs automatically at 6:00 AM
        Pacific.
      </p>
    </section>
  );
}
