export function stripHtml(input: string): string {
  const tmp = document.createElement("div");
  tmp.innerHTML = input;
  return (tmp.textContent || tmp.innerText || "").replace(/\s+/g, " ").trim();
}

/** Short plain-text blurb for job cards (never the full description). */
export function excerptDescription(input: string | undefined, maxLen = 180): string | undefined {
  if (!input) return undefined;
  const plain = stripHtml(input);
  if (!plain) return undefined;
  if (plain.length <= maxLen) return plain;
  const cut = plain.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  const trimmed = lastSpace > 100 ? cut.slice(0, lastSpace) : cut;
  return `${trimmed}…`;
}

export function formatJobDate(value?: string): string | undefined {
  if (!value) return undefined;
  const parsed = Date.parse(value);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  return value.trim() || undefined;
}

export function parseExpiresAt(value?: string): number | undefined {
  if (!value) return undefined;
  const slash = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slash) {
    const year = slash[3]!.length === 2 ? 2000 + Number(slash[3]) : Number(slash[3]);
    return Date.UTC(year, Number(slash[1]) - 1, Number(slash[2]));
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function extractRssMetadataFromDescription(plainText: string): {
  employer?: string;
  expiresAt?: string;
} {
  const text = plainText;
  const employerMatch = text.match(/(?:^|\b)Employer:\s*([^\n\r|]+?)(?:\bExpires:|$)/i);
  const expiresMatch = text.match(/(?:^|\b)Expires:\s*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4})/i);

  return {
    employer: employerMatch?.[1]?.trim(),
    expiresAt: expiresMatch?.[1]?.trim(),
  };
}

