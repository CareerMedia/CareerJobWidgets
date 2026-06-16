import { getBaseUrlForEmbeds } from "../../config/appConfig";

export function generateIframeEmbedCode(args: {
  title: string;
  route: string;
  height: number;
  baseUrl?: string;
  autoResize?: boolean;
}): string {
  const baseUrl = (args.baseUrl ?? getBaseUrlForEmbeds()).replace(/\/+$/, "");
  const route = args.route.replace(/^#?\/?/, "");
  const src = `${baseUrl}/#/${route}`;
  const height = Math.max(240, Math.floor(args.height));
  const autoResize = args.autoResize !== false;
  const embedJs = `${baseUrl}/embed.js`;

  const lines = [
    ...(autoResize
      ? [
          `<!-- Optional: auto-resize iframe to fit content (include once per host page) -->`,
          `<script src="${embedJs}" defer></script>`,
          "",
        ]
      : []),
    "<iframe",
    `  src="${src}"`,
    `  title="${escapeHtmlAttr(args.title)}"`,
    '  width="100%"',
    `  height="${height}"`,
    '  style="border:0; width:100%; max-width:100%; background:transparent; overflow:hidden;"',
    '  loading="lazy"',
    '  allowtransparency="true"',
    ...(autoResize ? ['  data-cjw-embed="true"'] : []),
    "></iframe>",
    "",
    "<!-- Fallback if the widget cannot load -->",
    `<noscript><a href="${src}" target="_blank" rel="noopener noreferrer">Open ${escapeHtmlText(
      args.title,
    )}</a></noscript>`,
  ];

  return lines.join("\n");
}

function escapeHtmlAttr(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeHtmlText(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

