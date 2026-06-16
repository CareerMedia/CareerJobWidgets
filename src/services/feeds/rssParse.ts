import type { JobItem } from "../../types/models";
import { stripHtml, extractRssMetadataFromDescription } from "../utils/text";

export function parseRssToJobs(args: {
  xmlText: string;
  feedId: string;
  feedName: string;
}): JobItem[] {
  const doc = new DOMParser().parseFromString(args.xmlText, "text/xml");
  const parseError = doc.querySelector("parsererror");
  if (parseError) throw new Error("RSS XML parse error.");

  const items = Array.from(doc.querySelectorAll("rss > channel > item"));
  return items
    .map((item) => {
      const guid = item.querySelector("guid")?.textContent?.trim();
      const title = item.querySelector("title")?.textContent?.trim();
      const descriptionRaw = item.querySelector("description")?.textContent ?? "";
      const description = stripHtml(descriptionRaw);
      const pubDate = item.querySelector("pubDate")?.textContent?.trim();
      const link = item.querySelector("link")?.textContent?.trim();
      const sourceUrl = item.querySelector("source")?.getAttribute("url") ?? undefined;

      if (!title || !link) return undefined;
      const meta = extractRssMetadataFromDescription(description);

      const id = guid || link;
      const job: JobItem = {
        id,
        feedId: args.feedId,
        feedName: args.feedName,
        title,
        description: description || undefined,
        pubDate: pubDate || undefined,
        applyUrl: link,
        sourceUrl,
        employer: meta.employer,
        expiresAt: meta.expiresAt,
        raw: undefined,
      };
      return job;
    })
    .filter((x): x is JobItem => Boolean(x));
}

