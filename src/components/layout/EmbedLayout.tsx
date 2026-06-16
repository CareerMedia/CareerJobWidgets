import React from "react";
import styles from "./EmbedLayout.module.css";

export function EmbedLayout(props: { children: React.ReactNode; background?: "white" | "transparent" }) {
  const bgClass = props.background === "transparent" ? styles.transparent : styles.white;
  return (
    <div className={[styles.root, bgClass].join(" ")}>
      {props.children}
    </div>
  );
}

