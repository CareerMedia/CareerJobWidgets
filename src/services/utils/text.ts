export function stripHtml(input: string): string {
  const tmp = document.createElement("div");
  tmp.innerHTML = input;
  return (tmp.textContent || tmp.innerText || "").replace(/\s+/g, " ").trim();
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

