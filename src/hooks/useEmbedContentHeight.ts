import React from "react";

/** Posts content height to parent page so embed iframes can resize without internal scrollbars. */
export function useEmbedContentHeight(enabled: boolean, deps: React.DependencyList = []) {
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!enabled) return;

    const report = () => {
      const root = rootRef.current;
      if (!root) return;
      const height = Math.ceil(root.getBoundingClientRect().height + 8);
      document.documentElement.style.height = "auto";
      document.documentElement.style.minHeight = "0";
      document.body.style.height = "auto";
      document.body.style.minHeight = "0";
      document.body.style.overflow = "visible";
      document.documentElement.style.overflow = "visible";

      if (window.parent !== window) {
        window.parent.postMessage({ type: "cjw-embed-height", height }, "*");
      }
    };

    report();
    const ro = new ResizeObserver(report);
    if (rootRef.current) ro.observe(rootRef.current);
    window.addEventListener("resize", report);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", report);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  return rootRef;
}
