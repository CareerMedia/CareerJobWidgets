import React from "react";
import { getAllJobsPageUrl } from "../../config/appConfig";
import { useWidgetSettings } from "../../state/widgetSettings";
import { Button } from "../ui/Button";
import styles from "./WidgetSettingsPanel.module.css";

export function WidgetSettingsPanel() {
  const { settings, bundled, allJobsUrl, setAllJobsUrl, resetAllJobsUrl } = useWidgetSettings();
  const [draft, setDraft] = React.useState(settings.allJobsUrl);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    setDraft(settings.allJobsUrl);
  }, [settings.allJobsUrl]);

  const defaultUrl = getAllJobsPageUrl();
  const siteDefault = bundled.allJobsUrl.trim() || defaultUrl;

  const onSave = () => {
    setAllJobsUrl(draft.trim());
  };

  const onCopyDeployJson = async () => {
    const json = JSON.stringify({ allJobsUrl: draft.trim() }, null, 2);
    await navigator.clipboard.writeText(json);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Widget settings</h2>
          <p className={styles.micro}>
            Configure the <strong>See All Jobs</strong> button in the featured jobs widget. Saved here applies in this
            browser immediately. For all visitors and embeds, copy the site config JSON into{" "}
            <code>public/data/widget-settings.json</code> and deploy.
          </p>
        </div>
      </div>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
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

        <div className={styles.actions}>
          <Button type="submit">Save (this browser)</Button>
          <Button type="button" variant="ghost" onClick={() => resetAllJobsUrl()}>
            Reset to site default
          </Button>
          <Button type="button" variant="ghost" onClick={() => void onCopyDeployJson()}>
            {copied ? "Copied!" : "Copy site config JSON"}
          </Button>
        </div>
      </form>
    </section>
  );
}
