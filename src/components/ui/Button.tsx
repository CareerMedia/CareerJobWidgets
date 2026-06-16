import React from "react";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "ghost" | "danger";

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant },
) {
  const { variant = "primary", className, ...rest } = props;
  return <button {...rest} className={[styles.btn, styles[variant], className].filter(Boolean).join(" ")} />;
}

