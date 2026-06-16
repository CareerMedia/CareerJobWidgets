import type { JobItem } from "../../types/models";

function getArrayFromUnknown(x: unknown): unknown[] | undefined {
  if (Array.isArray(x)) return x;
  if (!x || typeof x !== "object") return undefined;
  const o = x as Record<string, unknown>;
  const keys = ["jobs", "items", "results", "data"];
  for (const k of keys) {
    const v = o[k];
    if (Array.isArray(v)) return v;
  }
  return undefined;
}

function asString(x: unknown): string | undefined {
  if (typeof x === "string") return x;
  if (typeof x === "number") return String(x);
  return undefined;
}

export function parseJsonToJobs(args: {
  jsonText: string;
  feedId: string;
  feedName: string;
}): JobItem[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(args.jsonText);
  } catch {
    throw new Error("JSON parse error.");
  }
  const arr = getArrayFromUnknown(parsed);
  if (!arr) throw new Error("JSON feed does not contain a recognizable jobs array.");

  return arr
    .map((row) => {
      if (!row || typeof row !== "object") return undefined;
      const r = row as Record<string, unknown>;

      const title = asString(r.title ?? r.name ?? r.job_title);
      const applyUrl = asString(r.applyUrl ?? r.apply_url ?? r.application_url ?? r.url ?? r.link);
      if (!title || !applyUrl) return undefined;

      const id =
        asString(r.id ?? r.guid ?? r.reqId ?? r.requisition_id) ??
        `${args.feedId}:${title}:${applyUrl}`;

      const job: JobItem = {
        id,
        feedId: args.feedId,
        feedName: args.feedName,
        title,
        employer: asString(r.employer ?? r.company ?? r.organization),
        description: asString(r.description ?? r.body ?? r.summary),
        location: asString(r.location),
        jobType: asString(r.type ?? r.job_type),
        salary: asString(r.salary ?? r.compensation),
        pubDate: asString(r.date ?? r.pubDate ?? r.published ?? r.created_at),
        applyUrl,
        sourceUrl: asString(r.sourceUrl ?? r.source_url),
        raw: row,
      };
      return job;
    })
    .filter((x): x is JobItem => Boolean(x));
}

