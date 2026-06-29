import React from "react";
import { getAllJobsPageUrl } from "../config/appConfig";
import {
  DEFAULT_WIDGET_SETTINGS,
  loadBundledWidgetSettings,
  widgetSettingsStorage,
  type WidgetSettings,
} from "../services/storage/widgetSettingsStorage";
import { githubTokenStorage } from "../services/github/githubTokenStorage";
import { saveWidgetSettingsToRepo } from "../services/github/widgetSettingsRepoSync";
import { GitHubApiError } from "../services/github/githubApi";

function resolveAllJobsUrl(local: WidgetSettings, bundled: WidgetSettings): string {
  const fromBundled = bundled.allJobsUrl.trim();
  if (fromBundled) return fromBundled;
  const fromLocal = local.allJobsUrl.trim();
  if (fromLocal) return fromLocal;
  return getAllJobsPageUrl();
}

export type WidgetSyncState = {
  busy: boolean;
  message?: string;
};

type Ctx = {
  settings: WidgetSettings;
  bundled: WidgetSettings;
  allJobsUrl: string;
  syncState: WidgetSyncState;
  setAllJobsUrl: (url: string) => Promise<void>;
  resetAllJobsUrl: () => void;
  refreshBundled: () => Promise<void>;
};

const WidgetSettingsContext = React.createContext<Ctx | null>(null);

export function WidgetSettingsProvider(props: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<WidgetSettings>(() => widgetSettingsStorage.load());
  const [bundled, setBundled] = React.useState<WidgetSettings>(DEFAULT_WIDGET_SETTINGS);
  const [syncState, setSyncState] = React.useState<WidgetSyncState>({ busy: false });

  const refreshBundled = React.useCallback(async (): Promise<void> => {
    const next = await loadBundledWidgetSettings();
    setBundled(next);
  }, []);

  React.useEffect(() => {
    void refreshBundled();
  }, [refreshBundled]);

  const allJobsUrl = React.useMemo(() => resolveAllJobsUrl(settings, bundled), [settings, bundled]);

  const setAllJobsUrl = React.useCallback(
    async (url: string) => {
      const next = { allJobsUrl: url };
      setSettings(next);
      widgetSettingsStorage.save(next);

      const token = githubTokenStorage.load();
      if (!token) return;

      setSyncState({ busy: true });
      try {
        await saveWidgetSettingsToRepo(url, token);
        await refreshBundled();
        setSyncState({ busy: false, message: "Settings saved to GitHub. They’ll appear everywhere after deploy (~1 min)." });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to save settings.";
        setSyncState({ busy: false });
        throw new GitHubApiError(msg);
      }
    },
    [refreshBundled],
  );

  const resetAllJobsUrl = React.useCallback(() => {
    setSettings({ ...DEFAULT_WIDGET_SETTINGS });
    widgetSettingsStorage.clear();
    setSyncState({ busy: false });
  }, []);

  const value: Ctx = { settings, bundled, allJobsUrl, syncState, setAllJobsUrl, resetAllJobsUrl, refreshBundled };
  return <WidgetSettingsContext.Provider value={value}>{props.children}</WidgetSettingsContext.Provider>;
}

export function useWidgetSettings(): Ctx {
  const ctx = React.useContext(WidgetSettingsContext);
  if (!ctx) throw new Error("useWidgetSettings must be used within WidgetSettingsProvider");
  return ctx;
}
