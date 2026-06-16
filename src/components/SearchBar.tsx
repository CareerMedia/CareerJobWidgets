import React from "react";
import styles from "./SearchBar.module.css";

export function SearchBar(props: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  label?: string;
}) {
  const id = React.useId();
  return (
    <div className={styles.wrap}>
      <label className={styles.label} htmlFor={id}>
        {props.label ?? "Search"}
      </label>
      <input
        id={id}
        className={styles.input}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder ?? "Search jobs by title, employer, location, keyword…"}
        inputMode="search"
      />
    </div>
  );
}

