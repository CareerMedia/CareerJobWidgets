import React from "react";
import { Link } from "react-router-dom";
import { ADMIN_SESSION_KEY } from "../config/appConfig";
import { useFeedConfigs } from "../state/feedConfigs";
import { fetchAndParseFeed } from "../services/feeds/feedService";
import type { FeedCheckStatus, FeedConfig, FeedFetchError } from "../types/models";
import { AdminLogin } from "../components/admin/AdminLogin";
import { FeedForm } from "../components/admin/FeedForm";
import { FeedList } from "../components/admin/FeedList";
import { WidgetEmbedCenter } from "../components/admin/WidgetEmbedCenter";
import { FeedSyncPanel } from "../components/admin/FeedSyncPanel";
import { Button } from "../components/ui/Button";
import { generateIframeEmbedCode } from "../services/embeds/embedCode";
import styles from "./AdminPage.module.css";

type FeedStatusState = { status: FeedCheckStatus; error?: FeedFetchError };

export function AdminPage() {
  const [authed, setAuthed] = React.useState(() => sessionStorage.getItem(ADMIN_SESSION_KEY) === "true");
  const { feeds, upsertFeed, deleteFeed, setFeeds, exportJson, importJson, createNewFeed } = useFeedConfigs();
  const [tab, setTab] = React.useState<"feeds" | "embeds">("feeds");

  const [statusById, setStatusById] = React.useState<Record<string, FeedStatusState>>({});

  const [editing, setEditing] = React.useState<FeedConfig | null>(null);

  const onLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setAuthed(false);
  };

  const onTest = async (feed: FeedConfig) => {
    setStatusById((p) => ({ ...p, [feed.id]: { status: "loading" } }));
    const res = await fetchAndParseFeed(feed);
    setStatusById((p) => ({ ...p, [feed.id]: res.ok ? { status: "working" } : { status: "error", error: res.error } }));
  };

  const onExport = () => {
    const json = exportJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `career-job-widgets-feeds-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImport = async (file: File) => {
    const text = await file.text();
    importJson(text);
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  if (!authed) {
    return (
      <div className="container">
        <div className={styles.topNav}>
          <Link to="/" className={styles.brand}>
            Career Job Widgets
          </Link>
        </div>
        <AdminLogin onAuthed={() => setAuthed(true)} />
      </div>
    );
  }

  return (
    <div className="container">
      <div className={styles.topNav}>
        <Link to="/" className={styles.brand}>
          Career Job Widgets
        </Link>
        <div className={styles.navRight}>
          <button className={[styles.tab, tab === "feeds" ? styles.active : ""].join(" ")} type="button" onClick={() => setTab("feeds")}>
            Feeds
          </button>
          <button className={[styles.tab, tab === "embeds" ? styles.active : ""].join(" ")} type="button" onClick={() => setTab("embeds")}>
            Embed Codes
          </button>
          <Button type="button" variant="ghost" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </div>

      {tab === "feeds" ? (
        <div className={styles.stack}>
          <FeedSyncPanel />

          <div className={styles.grid}>
            <div className={styles.panel}>
              <h1 className={styles.h1}>Feeds</h1>
              <p className={styles.micro}>
                Configs persist in <code>localStorage</code>. Handshake feeds load from the synced JSON cache (see above).
              </p>

            <div className={styles.actionsRow}>
              <Button
                type="button"
                onClick={() => {
                  setEditing(createNewFeed());
                }}
              >
                Add feed
              </Button>
              <Button type="button" variant="ghost" onClick={onExport}>
                Export JSON
              </Button>
              <label className={styles.importLabel}>
                Import JSON
                <input
                  className={styles.file}
                  type="file"
                  accept="application/json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void onImport(file);
                    e.currentTarget.value = "";
                  }}
                />
              </label>
              <Button type="button" variant="ghost" onClick={() => setFeeds([])}>
                Clear all (local)
              </Button>
            </div>

            {editing ? (
              <FeedForm
                value={editing}
                onChange={setEditing}
                onSave={() => {
                  upsertFeed(editing);
                  setEditing(null);
                }}
                onCancel={() => setEditing(null)}
              />
            ) : null}
          </div>

          <div className={styles.panel}>
            <FeedList
              feeds={feeds}
              statusById={statusById}
              onEdit={(f) => setEditing(f)}
              onDelete={(id) => deleteFeed(id)}
              onToggleActive={(id) => {
                const f = feeds.find((x) => x.id === id);
                if (!f) return;
                upsertFeed({ ...f, active: !f.active });
              }}
              onTest={onTest}
              onPreviewDirectory={(f) => window.open(`#/embed/feed/${encodeURIComponent(f.id)}/directory`, "_blank", "noopener,noreferrer")}
              onPreviewFeatured={(f) => window.open(`#/embed/feed/${encodeURIComponent(f.id)}/featured`, "_blank", "noopener,noreferrer")}
              onCopyDirectoryEmbed={(f) =>
                void copyText(
                  generateIframeEmbedCode({
                    title: `${f.name} — Directory`,
                    route: `embed/feed/${encodeURIComponent(f.id)}/directory`,
                    height: 760,
                  }),
                )
              }
              onCopyFeaturedEmbed={(f) =>
                void copyText(
                  generateIframeEmbedCode({
                    title: `${f.name} — Featured`,
                    route: `embed/feed/${encodeURIComponent(f.id)}/featured`,
                    height: 520,
                  }),
                )
              }
            />
          </div>
        </div>
        </div>
      ) : (
        <WidgetEmbedCenter feeds={feeds} />
      )}
    </div>
  );
}

