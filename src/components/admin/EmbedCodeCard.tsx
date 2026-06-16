import React from "react";
import { CopyEmbedButton } from "../CopyEmbedButton";
import styles from "./EmbedCodeCard.module.css";

export function EmbedCodeCard(props: {
  label: string;
  description: string;
  code: string;
  previewHref: string;
  recommendedHeight: number;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <div className={styles.label}>{props.label}</div>
          <div className={styles.desc}>{props.description}</div>
          <div className={styles.meta}>Recommended height: {props.recommendedHeight}px</div>
        </div>
        <div className={styles.actions}>
          <a className={styles.preview} href={props.previewHref} target="_blank" rel="noopener noreferrer">
            Preview
          </a>
          <CopyEmbedButton text={props.code} />
        </div>
      </div>

      <pre className={styles.code} aria-label="Embed code">
        {props.code}
      </pre>
    </div>
  );
}

