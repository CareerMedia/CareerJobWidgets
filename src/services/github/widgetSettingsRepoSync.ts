import { readRepoFile, writeRepoFile } from "./githubApi";

const WIDGET_SETTINGS_PATH = "public/data/widget-settings.json";

export async function saveWidgetSettingsToRepo(allJobsUrl: string, token: string): Promise<void> {
  const existing = await readRepoFile(WIDGET_SETTINGS_PATH, token);
  const json = JSON.stringify({ allJobsUrl: allJobsUrl.trim() }, null, 2) + "\n";
  await writeRepoFile(
    WIDGET_SETTINGS_PATH,
    json,
    "chore: update widget settings from admin",
    token,
    existing?.sha,
  );
}
