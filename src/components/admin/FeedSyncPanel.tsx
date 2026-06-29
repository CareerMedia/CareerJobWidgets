import React from "react";
import { fetchBundledManifest } from "../../services/feeds/feedBundled";
import { Button } from "../ui/Button";
import styles from "./FeedSyncPanel.module.css";

export function FeedSyncPanel(props: { onRefreshFeeds?: () => void }) {
  const [manifest, setManifest] = React.useState<Awaited<ReturnType<typeof fetchBundledManifest>>>(null);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setManifest(await fetchBundledManifest());
    setLoading(false);
    props.onRefreshFeeds?.();
  }, [props.onRefreshFeeds]);

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
          <h2 className={styles.title}>Feed sync status</h2>
          <p className={styles.micro}>
            When you save a feed, GitHub Actions fetches the jobs server-side and updates the site automatically. No
            manual <code>feeds.sync.json</code> editing required.
          </p>
        </div>
        <Button type="button" variant="ghost" onClick={() => void refresh()}>
          Refresh status
        </Button>
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
        <p className={styles.micro}>No cached feeds yet. Add a feed above after connecting GitHub.</p>
      )}
    </section>
  );
}
