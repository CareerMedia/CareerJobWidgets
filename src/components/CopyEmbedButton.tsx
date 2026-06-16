import React from "react";
import { Button } from "./ui/Button";

export function CopyEmbedButton(props: { text: string; label?: string }) {
  const [status, setStatus] = React.useState<"idle" | "copied" | "error">("idle");

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(props.text);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 1300);
    } catch {
      setStatus("error");
      window.setTimeout(() => setStatus("idle"), 2000);
    }
  };

  const label = status === "copied" ? "Copied!" : status === "error" ? "Copy failed" : props.label ?? "Copy Embed Code";
  return (
    <Button type="button" variant={status === "error" ? "danger" : "primary"} onClick={onCopy} aria-label="Copy embed code">
      {label}
    </Button>
  );
}

