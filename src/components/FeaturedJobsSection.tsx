import React from "react";
import type { JobItem } from "../types/models";
import { useWidgetSettings } from "../state/widgetSettings";
import { FeaturedJobCard } from "./FeaturedJobCard";
import styles from "./FeaturedJobsSection.module.css";

function shuffleJobs(jobs: JobItem[]): JobItem[] {
  const copy = [...jobs];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = tmp;
  }
  return copy;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

function useCardsVisible(viewportRef: React.RefObject<HTMLDivElement | null>) {
  const [cardsVisible, setCardsVisible] = React.useState(3);
  const [cardWidth, setCardWidth] = React.useState(320);

  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      const visible = w >= 960 ? 3 : w >= 640 ? 2 : 1;
      const gap = 20;
      setCardsVisible(visible);
      setCardWidth(Math.max(260, (w - gap * (visible - 1)) / visible));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [viewportRef]);

  return { cardsVisible, cardWidth };
}

export function FeaturedJobsSection(props: {
  jobs: JobItem[];
  feedId?: string;
  title?: string;
  subtitle?: string;
  maxItems?: number;
  allJobsUrl?: string;
  autoScroll?: boolean;
  isLoading?: boolean;
  errorMessage?: string;
}) {
  const { allJobsUrl: settingsUrl } = useWidgetSettings();
  const title = props.title ?? "Available Jobs & Internships";
  const subtitle = props.subtitle ?? "Explore opportunities curated from our career feeds.";
  const allJobsUrl = props.allJobsUrl ?? settingsUrl;
  const autoScrollEnabled = props.autoScroll !== false;
  const prefersReducedMotion = usePrefersReducedMotion();

  const viewportRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const { cardsVisible, cardWidth } = useCardsVisible(viewportRef);

  const [paused, setPaused] = React.useState(false);
  const [manualOffset, setManualOffset] = React.useState(0);

  const sourceJobs = React.useMemo(() => {
    const pool = props.feedId ? props.jobs.filter((j) => j.feedId === props.feedId) : props.jobs;
    const limit = props.maxItems ?? 18;
    return shuffleJobs(pool).slice(0, Math.min(limit, pool.length));
  }, [props.jobs, props.feedId, props.maxItems]);

  const loopItems = React.useMemo(
    () => (sourceJobs.length > 0 ? [...sourceJobs, ...sourceJobs] : []),
    [sourceJobs],
  );

  const canScroll = sourceJobs.length > cardsVisible;
  const shouldAnimate = autoScrollEnabled && !prefersReducedMotion && canScroll;
  const displayItems = shouldAnimate ? loopItems : sourceJobs;

  const scrollByCards = (direction: -1 | 1) => {
    const el = viewportRef.current;
    if (!el) return;
    const step = cardWidth + 20;
    if (prefersReducedMotion || !shouldAnimate) {
      el.scrollBy({ left: direction * step, behavior: "smooth" });
      return;
    }
    setManualOffset((v) => v + direction * step);
  };

  React.useEffect(() => {
    if (!shouldAnimate || paused) return;
    let raf = 0;
    let last = performance.now();
    const speed = 28;

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const track = trackRef.current;
      if (track) {
        const half = track.scrollWidth / 2;
        setManualOffset((v) => {
          let next = v + speed * dt;
          if (half > 0 && next >= half) next -= half;
          return next;
        });
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shouldAnimate, paused, sourceJobs.length, cardWidth]);

  const trackStyle: React.CSSProperties = shouldAnimate
    ? { transform: `translate3d(-${manualOffset}px, 0, 0)`, gap: 20 }
    : { gap: 20 };

  return (
    <section
      className={styles.section}
      aria-label={title}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false);
      }}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <p className={styles.kicker}>Featured opportunities</p>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>
          <a className={styles.seeAll} href={allJobsUrl} target="_blank" rel="noopener noreferrer">
            See All Jobs <span aria-hidden="true">→</span>
          </a>
        </div>

        {props.errorMessage ? (
          <div className={styles.alert} role="alert">
            <strong>Some feeds could not be loaded.</strong> {props.errorMessage}
          </div>
        ) : null}

        {props.isLoading ? (
          <div className={styles.loading}>Loading featured jobs…</div>
        ) : sourceJobs.length === 0 ? (
          <div className={styles.empty}>No featured jobs available right now.</div>
        ) : (
          <div className={styles.carousel}>
            {canScroll ? (
              <>
                <button
                  type="button"
                  className={[styles.arrow, styles.arrowLeft].join(" ")}
                  onClick={() => scrollByCards(-1)}
                  aria-label="Previous jobs"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className={[styles.arrow, styles.arrowRight].join(" ")}
                  onClick={() => scrollByCards(1)}
                  aria-label="Next jobs"
                >
                  ›
                </button>
              </>
            ) : null}

            <div
              ref={viewportRef}
              className={[styles.viewport, prefersReducedMotion || !shouldAnimate ? styles.viewportManual : ""]
                .filter(Boolean)
                .join(" ")}
            >
              <div
                ref={trackRef}
                className={[styles.track, shouldAnimate && !paused ? styles.trackAnimated : ""].filter(Boolean).join(" ")}
                style={trackStyle}
              >
                {displayItems.map((job, index) => (
                  <div
                    key={`${job.feedId}:${job.id}:${index}`}
                    className={styles.cardSlot}
                    style={{ width: cardWidth, minWidth: cardWidth }}
                  >
                    <FeaturedJobCard job={job} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
