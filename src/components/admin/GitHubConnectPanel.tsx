import React from "react";
import { GITHUB_REPO_SLUG } from "../../config/appConfig";
import { verifyGitHubToken } from "../../services/github/githubApi";
import { githubTokenStorage } from "../../services/github/githubTokenStorage";
import { Button } from "../ui/Button";
import styles from "./GitHubConnectPanel.module.css";

const PAT_DOCS_URL = `https://github.com/settings/tokens?type=beta`;

export function GitHubConnectPanel() {
  const [token, setToken] = React.useState(() => githubTokenStorage.load());
  const [login, setLogin] = React.useState<string | null>(null);
  const [checking, setChecking] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  const checkToken = React.useCallback(async (value: string) => {
    if (!value.trim()) {
      setLogin(null);
      return;
    }
    setChecking(true);
    setError(null);
    const res = await verifyGitHubToken(value.trim());
    setChecking(false);
    if (res.ok) setLogin(res.login);
    else {
      setLogin(null);
      setError(res.message);
    }
  }, []);

  React.useEffect(() => {
    const stored = githubTokenStorage.load();
    if (stored) void checkToken(stored);
  }, [checkToken]);

  const onSave = async () => {
    setSaved(false);
    setError(null);
    const trimmed = token.trim();
    if (!trimmed) {
      githubTokenStorage.clear();
      setLogin(null);
      return;
    }
    const res = await verifyGitHubToken(trimmed);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    githubTokenStorage.save(trimmed);
    setLogin(res.login);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const onDisconnect = () => {
    githubTokenStorage.clear();
    setToken("");
    setLogin(null);
    setError(null);
  };

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>GitHub connection</h2>
          <p className={styles.micro}>
            Feeds and widget settings are saved to the <strong>{GITHUB_REPO_SLUG}</strong> repo so your work syncs
            across computers. Connect once with a personal access token — after that, adding a feed is just name + URL.
          </p>
        </div>
        {login ? <span className={styles.connected}>Connected as {login}</span> : null}
      </div>

      <div className={styles.form}>
        <label className={styles.label}>
          GitHub personal access token
          <input
            className={styles.input}
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="github_pat_…"
            autoComplete="off"
          />
        </label>
        <p className={styles.hint}>
          Create a <a href={PAT_DOCS_URL}>fine-grained token</a> for this repo with{" "}
          <strong>Contents: Read and write</strong> and <strong>Actions: Read and write</strong>.
        </p>

        {error ? <p className={styles.error}>{error}</p> : null}
        {checking ? <p className={styles.micro}>Verifying token…</p> : null}

        <div className={styles.actions}>
          <Button type="button" onClick={() => void onSave()}>
            {saved ? "Saved!" : "Save token"}
          </Button>
          {login ? (
            <Button type="button" variant="ghost" onClick={onDisconnect}>
              Disconnect
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
