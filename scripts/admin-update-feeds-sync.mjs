/**
 * Updates feeds.sync.json from a GitHub Actions workflow_dispatch payload.
 *
 * Env:
 *   ACTION     - "upsert" | "delete"
 *   FEED_JSON  - JSON string (full feed for upsert, or { id } for delete)
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.resolve(__dirname, "..", "feeds.sync.json");

function pickSyncFields(feed) {
  const out = {
    id: feed.id,
    name: feed.name,
    url: feed.url,
    type: feed.type ?? "auto",
    active: feed.active !== false,
  };
  if (feed.description) out.description = feed.description;
  if (feed.category) out.category = feed.category;
  if (feed.urlEnv) out.urlEnv = feed.urlEnv;
  return out;
}

async function main() {
  const action = process.env.ACTION;
  const feedJson = process.env.FEED_JSON;
  if (!action || !feedJson) {
    throw new Error("ACTION and FEED_JSON are required.");
  }

  const feed = JSON.parse(feedJson);
  if (!feed?.id || typeof feed.id !== "string") {
    throw new Error("FEED_JSON must include a string id.");
  }

  const raw = await fs.readFile(CONFIG_PATH, "utf8");
  const config = JSON.parse(raw);
  const feeds = Array.isArray(config.feeds) ? [...config.feeds] : [];

  if (action === "delete") {
    const next = feeds.filter((f) => f.id !== feed.id);
    if (next.length === feeds.length) {
      console.log(`Feed ${feed.id} not found in feeds.sync.json — nothing to delete.`);
    } else {
      console.log(`Removed feed ${feed.id} from feeds.sync.json.`);
    }
    config.feeds = next;
  } else if (action === "upsert") {
    if (!feed.name || !feed.url) {
      throw new Error("Upsert requires name and url.");
    }
    const entry = pickSyncFields(feed);
    const idx = feeds.findIndex((f) => f.id === entry.id);
    if (idx >= 0) {
      feeds[idx] = { ...feeds[idx], ...entry };
      console.log(`Updated feed ${entry.id} in feeds.sync.json.`);
    } else {
      feeds.push(entry);
      console.log(`Added feed ${entry.id} to feeds.sync.json.`);
    }
    config.feeds = feeds;
  } else {
    throw new Error(`Unknown ACTION: ${action}`);
  }

  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n", "utf8");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
