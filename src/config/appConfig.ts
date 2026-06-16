// Central place for production settings.
// GitHub Pages note:
// - If you set this to your public Pages URL, embed codes will always use it (recommended).
// - If left empty, we fall back to the current origin + pathname.
export const PRODUCTION_PAGES_URL = "";

export function getBaseUrlForEmbeds(): string {
  const trimmed = PRODUCTION_PAGES_URL.trim();
  if (trimmed) return trimmed.replace(/\/+$/, "");

  // Works for both local dev and GitHub Pages paths:
  // - origin: https://example.github.io
  // - pathname: /CareerJobWidgets/ (project pages) or / (user pages)
  const base = `${window.location.origin}${window.location.pathname}`.replace(/\/+$/, "");
  return base;
}

// Shared-password admin gate note:
// This is *not* enterprise-grade security. Static hosting means anyone can view the JS bundle.
// This gate is intended only as lightweight friction to prevent casual access.
export const ADMIN_SESSION_KEY = "cjw_admin_authed_v1";

// SHA-256 base64 hash of the shared admin password (plaintext is not stored here).
// To change: hash a new password with sha256Base64() in src/services/security/passwordGate.ts.
export const ADMIN_PASSWORD_SHA256_BASE64 = "oEEUDbqIMbRkVhmG54UIC3+gdYugM/CPbMVKapscIvo=";

