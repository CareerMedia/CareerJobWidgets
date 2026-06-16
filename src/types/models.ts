export type FeedType = "auto" | "rss" | "json";

export interface FeedConfig {
  id: string;
  name: string;
  url: string;
  type: FeedType;
  description?: string;
  category?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobItem {
  id: string;
  feedId: string;
  feedName: string;
  title: string;
  employer?: string;
  description?: string;
  location?: string;
  jobType?: string;
  salary?: string;
  pubDate?: string;
  expiresAt?: string;
  applyUrl: string;
  sourceUrl?: string;
  raw?: unknown;
}

export type WidgetType =
  | "all-jobs"
  | "featured-jobs"
  | "feed-tabs"
  | "feed-directory"
  | "feed-featured";

export interface EmbedConfig {
  id: string;
  label: string;
  description: string;
  widgetType: WidgetType;
  feedId?: string;
  recommendedHeight: number;
  route: string;
}

export type FeedCheckStatus = "unchecked" | "loading" | "working" | "error";

export type FeedFetchError =
  | { kind: "cors"; message: string }
  | { kind: "network"; message: string }
  | { kind: "parse"; message: string }
  | { kind: "unknown"; message: string };

