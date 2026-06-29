const STORAGE_KEY = "cjw_github_pat_v1";

export const githubTokenStorage = {
  load(): string {
    return localStorage.getItem(STORAGE_KEY)?.trim() ?? "";
  },
  save(token: string) {
    const trimmed = token.trim();
    if (trimmed) localStorage.setItem(STORAGE_KEY, trimmed);
    else localStorage.removeItem(STORAGE_KEY);
  },
  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },
};
