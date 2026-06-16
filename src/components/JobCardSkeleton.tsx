import styles from "./JobCardSkeleton.module.css";

export function JobCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={styles.accent} />
      <div className={styles.body}>
        <div className={[styles.line, styles.title].join(" ")} />
        <div className={[styles.line, styles.short].join(" ")} />
        <div className={styles.pill} />
        <div className={styles.line} />
        <div className={styles.line} />
        <div className={[styles.line, styles.block].join(" ")} />
      </div>
      <div className={styles.btn} />
    </div>
  );
}
