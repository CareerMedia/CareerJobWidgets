import { getBaseUrlForEmbeds } from "../../config/appConfig";

export function generateIframeEmbedCode(args: {
  title: string;
  route: string;
  height: number;
  baseUrl?: string;
}): string {
  const baseUrl = (args.baseUrl ?? getBaseUrlForEmbeds()).replace(/\/+$/, "");
  const route = args.route.replace(/^#?\/?/, "");
  const src = `${baseUrl}/#/${route}`;
  const height = Math.max(240, Math.floor(args.height));

  return [
    "<iframe",
    `  src="${src}"`,
    `  title="${escapeHtmlAttr(args.title)}"`,
    '  width="100%"',
    `  height="${height}"`,
    '  style="border:0; width:100%; max-width:100%; background:transparent;"',
    '  loading="lazy"',
    '  allowtransparency="true"',
    "></iframe>",
    "",
    "<!-- Fallback if the widget cannot load -->",
    `<noscript><a href="${src}" target="_blank" rel="noopener noreferrer">Open ${escapeHtmlText(
      args.title,
    )}</a></noscript>`,
  ].join("\n");
}

function escapeHtmlAttr(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeHtmlText(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

