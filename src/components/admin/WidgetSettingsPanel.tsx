import React from "react";
import { getAllJobsPageUrl } from "../../config/appConfig";
import { useWidgetSettings } from "../../state/widgetSettings";
import { githubTokenStorage } from "../../services/github/githubTokenStorage";
import { Button } from "../ui/Button";
import styles from "./WidgetSettingsPanel.module.css";

export function WidgetSettingsPanel() {
  const { settings, bundled, allJobsUrl, setAllJobsUrl, resetAllJobsUrl, syncState } = useWidgetSettings();
  const [draft, setDraft] = React.useState(settings.allJobsUrl);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setDraft(settings.allJobsUrl);
  }, [settings.allJobsUrl]);

  const defaultUrl = getAllJobsPageUrl();
  const siteDefault = bundled.allJobsUrl.trim() || defaultUrl;
  const hasGitHub = Boolean(githubTokenStorage.load());

  const onSave = async () => {
    setError(null);
    try {
      await setAllJobsUrl(draft.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings.");
    }
  };

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Widget settings</h2>
          <p className={styles.micro}>
            Configure the <strong>See All Jobs</strong> button in the featured jobs widget. Saves to GitHub when
            connected, so it applies everywhere.
          </p>
        </div>
      </div>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          void onSave();
        }}
      >
        <label className={styles.label}>
          See All Jobs URL
          <input
            className={styles.input}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={siteDefault}
          />
        </label>

        <p className={styles.hint}>
          Leave blank to use the site default: <a href={siteDefault}>{siteDefault}</a>
        </p>

        <p className={styles.effective}>
          Effective URL: <a href={allJobsUrl}>{allJobsUrl}</a>
        </p>

        {error ? <p className={styles.error}>{error}</p> : null}
        {syncState.message ? <p className={styles.saved}>{syncState.message}</p> : null}

        <div className={styles.actions}>
          <Button type="submit" disabled={syncState.busy}>
            {syncState.busy ? "Saving…" : hasGitHub ? "Save to GitHub" : "Save (connect GitHub to sync)"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => resetAllJobsUrl()} disabled={syncState.busy}>
            Reset to site default
          </Button>
        </div>
      </form>
    </section>
  );
}
