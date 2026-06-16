/**
 * Fetches feeds server-side (no CORS) and writes normalized job JSON into public/data/feeds/.
 * Run before build/deploy so GitHub Pages can load Handshake and other CORS-blocked feeds.
 *
 * Config: feeds.sync.json
 * Optional: set urlEnv on a feed entry to read the URL from an environment variable instead.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONFIG_PATH = path.join(ROOT, "feeds.sync.json");
const OUT_DIR = path.join(ROOT, "public", "data", "feeds");

function stripHtml(input) {
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function extractRssMetadataFromDescription(plainText) {
  const employerMatch = plainText.match(/(?:^|\b)Employer:\s*([^\n\r|]+?)(?:\bExpires:|$)/i);
  const expiresMatch = plainText.match(/(?:^|\b)Expires:\s*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4})/i);
  return {
    employer: employerMatch?.[1]?.trim(),
    expiresAt: expiresMatch?.[1]?.trim(),
  };
}

function readTag(block, tag) {
  const re = new RegExp(`<${tag}([^>]*)>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = block.match(re);
  return m?.[2]?.trim();
}

function readSourceUrl(block) {
  const m = block.match(/<source[^>]*url="([^"]+)"/i);
  return m?.[1];
}

function parseRssToJobs({ xmlText, feedId, feedName }) {
  const items = [...xmlText.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((m) => m[1]);
  const jobs = [];
  for (const item of items) {
    const guid = readTag(item, "guid");
    const title = stripHtml(readTag(item, "title") ?? "");
    const descriptionRaw = readTag(item, "description") ?? "";
    const description = stripHtml(descriptionRaw);
    const pubDate = readTag(item, "pubDate");
    const link = readTag(item, "link");
    const sourceUrl = readSourceUrl(item);
    if (!title || !link) continue;
    const meta = extractRssMetadataFromDescription(description);
    jobs.push({
      id: guid || link,
      feedId,
      feedName,
      title,
      description: description || undefined,
      pubDate: pubDate || undefined,
      applyUrl: link,
      sourceUrl,
      employer: meta.employer,
      expiresAt: meta.expiresAt,
    });
  }
  return jobs;
}

function getArrayFromUnknown(x) {
  if (Array.isArray(x)) return x;
  if (!x || typeof x !== "object") return undefined;
  for (const k of ["jobs", "items", "results", "data"]) {
    if (Array.isArray(x[k])) return x[k];
  }
  return undefined;
}

function asString(x) {
  if (typeof x === "string") return x;
  if (typeof x === "number") return String(x);
  return undefined;
}

function parseJsonToJobs({ jsonText, feedId, feedName }) {
  const parsed = JSON.parse(jsonText);
  const arr = getArrayFromUnknown(parsed);
  if (!arr) throw new Error("JSON feed does not contain a recognizable jobs array.");
  const jobs = [];
  for (const row of arr) {
    if (!row || typeof row !== "object") continue;
    const title = asString(row.title ?? row.name ?? row.job_title);
    const applyUrl = asString(row.applyUrl ?? row.apply_url ?? row.application_url ?? row.url ?? row.link);
    if (!title || !applyUrl) continue;
    jobs.push({
      id: asString(row.id ?? row.guid ?? row.reqId ?? row.requisition_id) ?? `${feedId}:${title}:${applyUrl}`,
      feedId,
      feedName,
      title,
      employer: asString(row.employer ?? row.company ?? row.organization),
      description: asString(row.description ?? row.body ?? row.summary),
      location: asString(row.location),
      jobType: asString(row.type ?? row.job_type),
      salary: asString(row.salary ?? row.compensation),
      pubDate: asString(row.date ?? row.pubDate ?? row.published ?? row.created_at),
      applyUrl,
      sourceUrl: asString(row.sourceUrl ?? row.source_url),
    });
  }
  return jobs;
}

function detectType(configured, bodyText) {
  if (configured === "rss" || configured === "json") return configured;
  return bodyText.trim().startsWith("<") ? "rss" : "json";
}

async function fetchFeedText(url) {
  const res = await fetch(url, { headers: { Accept: "application/rss+xml, application/json, */*" } });
  if (!res.ok) throw new Error(`Request failed (${res.status}) for ${url}`);
  return res.text();
}

async function main() {
  const raw = await fs.readFile(CONFIG_PATH, "utf8");
  const config = JSON.parse(raw);
  const feeds = Array.isArray(config.feeds) ? config.feeds : [];
  await fs.mkdir(OUT_DIR, { recursive: true });

  const manifest = {
    syncedAt: new Date().toISOString(),
    feeds: {},
    urlIndex: {},
    idIndex: {},
  };

  for (const feed of feeds) {
    const url = feed.urlEnv ? process.env[feed.urlEnv] || feed.url : feed.url;
    if (!url) {
      console.warn(`Skipping feed ${feed.id}: no URL`);
      continue;
    }
    console.log(`Syncing ${feed.id} …`);
    const text = await fetchFeedText(url);
    const type = detectType(feed.type ?? "auto", text);
    const jobs =
      type === "rss"
        ? parseRssToJobs({ xmlText: text, feedId: feed.id, feedName: feed.name })
        : parseJsonToJobs({ jsonText: text, feedId: feed.id, feedName: feed.name });

    const fileName = `${feed.id}.json`;
    const outPath = path.join(OUT_DIR, fileName);
    await fs.writeFile(
      outPath,
      JSON.stringify({ feedId: feed.id, syncedAt: manifest.syncedAt, jobs }, null, 2),
      "utf8",
    );

    manifest.feeds[feed.id] = { url, file: fileName, jobCount: jobs.length, type };
    manifest.urlIndex[url] = fileName;
    manifest.idIndex[feed.id] = fileName;
    console.log(`  → ${jobs.length} jobs → ${fileName}`);
  }

  await fs.writeFile(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  console.log(`Wrote manifest with ${Object.keys(manifest.feeds).length} feed(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
