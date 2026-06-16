import React from "react";
import "../../styles/embed.css";
import styles from "./EmbedLayout.module.css";
import { useEmbedContentHeight } from "../../hooks/useEmbedContentHeight";

export function EmbedLayout(props: { children: React.ReactNode }) {
  const rootRef = useEmbedContentHeight(true);

  React.useEffect(() => {
    document.documentElement.classList.add("embed-mode");
    return () => document.documentElement.classList.remove("embed-mode");
  }, []);

  return (
    <div ref={rootRef} className={[styles.root, styles.transparent].join(" ")}>
      {props.children}
    </div>
  );
}
