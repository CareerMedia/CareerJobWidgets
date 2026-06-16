import React from "react";
import "../../styles/embed.css";
import styles from "./EmbedLayout.module.css";

export type EmbedLayoutVariant = "transparent" | "featured";

export function EmbedLayout(props: { children: React.ReactNode; variant?: EmbedLayoutVariant }) {
  const variant = props.variant ?? "transparent";

  React.useEffect(() => {
    const cls = variant === "featured" ? "embed-featured-mode" : "embed-mode";
    document.documentElement.classList.add(cls);
    return () => document.documentElement.classList.remove(cls);
  }, [variant]);

  return (
    <div className={[styles.root, variant === "featured" ? styles.featured : styles.transparent].join(" ")}>
      {props.children}
    </div>
  );
}
