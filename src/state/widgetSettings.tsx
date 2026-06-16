import React from "react";
import { getAllJobsPageUrl } from "../config/appConfig";
import {
  DEFAULT_WIDGET_SETTINGS,
  loadBundledWidgetSettings,
  widgetSettingsStorage,
  type WidgetSettings,
} from "../services/storage/widgetSettingsStorage";

function resolveAllJobsUrl(local: WidgetSettings, bundled: WidgetSettings): string {
  const fromLocal = local.allJobsUrl.trim();
  if (fromLocal) return fromLocal;
  const fromBundled = bundled.allJobsUrl.trim();
  if (fromBundled) return fromBundled;
  return getAllJobsPageUrl();
}

type Ctx = {
  settings: WidgetSettings;
  bundled: WidgetSettings;
  allJobsUrl: string;
  setAllJobsUrl: (url: string) => void;
  resetAllJobsUrl: () => void;
};

const WidgetSettingsContext = React.createContext<Ctx | null>(null);

export function WidgetSettingsProvider(props: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<WidgetSettings>(() => widgetSettingsStorage.load());
  const [bundled, setBundled] = React.useState<WidgetSettings>(DEFAULT_WIDGET_SETTINGS);

  React.useEffect(() => {
    void loadBundledWidgetSettings().then(setBundled);
  }, []);

  const allJobsUrl = React.useMemo(() => resolveAllJobsUrl(settings, bundled), [settings, bundled]);

  const setAllJobsUrl = React.useCallback((url: string) => {
    const next = { allJobsUrl: url };
    setSettings(next);
    widgetSettingsStorage.save(next);
  }, []);

  const resetAllJobsUrl = React.useCallback(() => {
    setSettings({ ...DEFAULT_WIDGET_SETTINGS });
    widgetSettingsStorage.clear();
  }, []);

  const value: Ctx = { settings, bundled, allJobsUrl, setAllJobsUrl, resetAllJobsUrl };
  return <WidgetSettingsContext.Provider value={value}>{props.children}</WidgetSettingsContext.Provider>;
}

export function useWidgetSettings(): Ctx {
  const ctx = React.useContext(WidgetSettingsContext);
  if (!ctx) throw new Error("useWidgetSettings must be used within WidgetSettingsProvider");
  return ctx;
}
