export type WidgetSettings = {
  allJobsUrl: string;
};

const STORAGE_KEY = "cjw_widget_settings_v1";

export const DEFAULT_WIDGET_SETTINGS: WidgetSettings = {
  allJobsUrl: "",
};

function safeParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function normalize(settings: Partial<WidgetSettings> | undefined): WidgetSettings {
  return {
    allJobsUrl: typeof settings?.allJobsUrl === "string" ? settings.allJobsUrl : "",
  };
}

export const widgetSettingsStorage = {
  load(): WidgetSettings {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_WIDGET_SETTINGS };
    const parsed = safeParseJson(raw);
    if (!parsed || typeof parsed !== "object") return { ...DEFAULT_WIDGET_SETTINGS };
    return normalize(parsed as Partial<WidgetSettings>);
  },
  save(settings: WidgetSettings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalize(settings)));
  },
  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },
};

export async function loadBundledWidgetSettings(): Promise<WidgetSettings> {
  const base = import.meta.env.BASE_URL;
  try {
    const res = await fetch(`${base}data/widget-settings.json`);
    if (!res.ok) return { ...DEFAULT_WIDGET_SETTINGS };
    const data = (await res.json()) as Partial<WidgetSettings>;
    return normalize(data);
  } catch {
    return { ...DEFAULT_WIDGET_SETTINGS };
  }
}
