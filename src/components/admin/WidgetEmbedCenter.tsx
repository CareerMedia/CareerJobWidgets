import React from "react";
import type { EmbedConfig, FeedConfig } from "../../types/models";
import { generateIframeEmbedCode } from "../../services/embeds/embedCode";
import { EmbedCodeCard } from "./EmbedCodeCard";
import styles from "./WidgetEmbedCenter.module.css";

function buildEmbedConfigs(feeds: FeedConfig[]): EmbedConfig[] {
  const base: EmbedConfig[] = [
    {
      id: "all_jobs",
      label: "All jobs directory",
      description: "Main searchable directory combining all active feeds.",
      widgetType: "all-jobs",
      recommendedHeight: 760,
      route: "embed/all-jobs",
    },
    {
      id: "featured_all",
      label: "Featured jobs scroller",
      description: "Polished horizontal featured cards using all active feeds.",
      widgetType: "featured-jobs",
      recommendedHeight: 520,
      route: "embed/featured-jobs",
    },
    {
      id: "feed_tabs",
      label: "Feed tabs widget",
      description: "Consolidated widget with feed chips and a searchable directory view.",
      widgetType: "feed-tabs",
      recommendedHeight: 820,
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
      recommendedHeight: 760,
      route: `embed/feed/${encodeURIComponent(f.id)}/directory`,
    },
    {
      id: `feat_${f.id}`,
      label: `${f.name} — Featured`,
      description: "Feed-specific featured jobs scroller widget.",
      widgetType: "feed-featured",
      feedId: f.id,
      recommendedHeight: 520,
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
            title: c.label,
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

