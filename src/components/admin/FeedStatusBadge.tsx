import React from "react";
import type { FeedCheckStatus } from "../../types/models";
import styles from "./FeedStatusBadge.module.css";

export function FeedStatusBadge(props: { status: FeedCheckStatus }) {
  return <span className={[styles.badge, styles[props.status]].join(" ")}>{props.status}</span>;
}

