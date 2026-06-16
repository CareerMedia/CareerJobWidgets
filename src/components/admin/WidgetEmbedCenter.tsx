import React from "react";
import type { EmbedConfig, FeedConfig } from "../../types/models";
import { generateIframeEmbedCode } from "../../services/embeds/embedCode";
import {
  EMBED_HEIGHT_DIRECTORY_PAGE,
  EMBED_HEIGHT_FEATURED,
  EMBED_HEIGHT_FEED_TABS_PAGE,
} from "../../services/embeds/embedHeights";
import { EmbedCodeCard } from "./EmbedCodeCard";
import styles from "./WidgetEmbedCenter.module.css";

function buildEmbedConfigs(feeds: FeedConfig[]): EmbedConfig[] {
  const base: EmbedConfig[] = [
    {
      id: "all_jobs",
      label: "All jobs directory",
      description: "Searchable directory with pagination (40 jobs per page). Include embed.js for auto-height iframes.",
      widgetType: "all-jobs",
      recommendedHeight: EMBED_HEIGHT_DIRECTORY_PAGE,
      route: "embed/all-jobs",
    },
    {
      id: "featured_all",
      label: "Homepage Featured Jobs Section",
      description: "Auto-scrolling featured job carousel. Transparent background. Include embed.js for auto-height iframes.",
      widgetType: "featured-jobs",
      recommendedHeight: EMBED_HEIGHT_FEATURED,
      route: "embed/featured-jobs",
    },
    {
      id: "feed_tabs",
      label: "Feed tabs widget",
      description: "Feed chips with paginated directory view (40 jobs per page).",
      widgetType: "feed-tabs",
      recommendedHeight: EMBED_HEIGHT_FEED_TABS_PAGE,
      route: "embed/feed-tabs",
    },
  ];

  const perFeed: EmbedConfig[] = feeds.flatMap((f) => [
    {
      id: `dir_${f.id}`,
      label: `${f.name} — Directory`,
      description: "Feed-specific searchable directory widget.",
      widgetType: "feed-directory",
      feedId: f.id,
      recommendedHeight: EMBED_HEIGHT_DIRECTORY_PAGE,
      route: `embed/feed/${encodeURIComponent(f.id)}/directory`,
    },
    {
      id: `feat_${f.id}`,
      label: `${f.name} — Homepage Featured Jobs`,
      description: "Feed-specific auto-scrolling featured jobs carousel.",
      widgetType: "feed-featured",
      feedId: f.id,
      recommendedHeight: EMBED_HEIGHT_FEATURED,
      route: `embed/feed/${encodeURIComponent(f.id)}/featured`,
    },
  ]);

  return [...base, ...perFeed];
}

export function WidgetEmbedCenter(props: { feeds: FeedConfig[] }) {
  const configs = React.useMemo(() => buildEmbedConfigs(props.feeds), [props.feeds]);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>Widget Embed Center</h2>
        <p className={styles.micro}>
          Copy-paste iframe embed codes. Iframes isolate widget styles from the host page (and vice versa).
        </p>
      </div>

      <div className={styles.list}>
        {configs.map((c) => {
          const code = generateIframeEmbedCode({
            title:
              c.widgetType === "featured-jobs" || c.widgetType === "feed-featured"
                ? "Available Jobs and Internships"
                : c.label,
            route: c.route,
            height: c.recommendedHeight,
          });
          const previewHref = `#/${c.route}`;
          return (
            <EmbedCodeCard
              key={c.id}
              label={c.label}
              description={c.description}
              code={code}
              previewHref={previewHref}
              recommendedHeight={c.recommendedHeight}
            />
          );
        })}
      </div>
    </div>
  );
}

