import React from "react";
import { ADMIN_PASSWORD_SHA256_BASE64, ADMIN_SESSION_KEY } from "../../config/appConfig";
import { sha256Base64 } from "../../services/security/passwordGate";
import { Button } from "../ui/Button";
import styles from "./AdminLogin.module.css";

export function AdminLogin(props: { onAuthed: () => void }) {
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const hash = await sha256Base64(password);
      if (hash === ADMIN_PASSWORD_SHA256_BASE64) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
        props.onAuthed();
      } else {
        setError("Incorrect password.");
      }
    } catch {
      setError("Login failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>Admin login</h1>
        <p className={styles.micro}>
          This is a lightweight client-side password gate (static hosting). It’s not enterprise-grade security.
        </p>

        <form onSubmit={onSubmit} className={styles.form}>
          <label className={styles.label}>
            Shared password
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error ? (
            <div className={styles.error} role="alert">
              {error}
            </div>
          ) : null}
          <Button type="submit" disabled={busy}>
            {busy ? "Checking…" : "Login"}
          </Button>
        </form>

        <details className={styles.details}>
          <summary>How to change the password hash</summary>
          <p className={styles.micro}>
            Open DevTools and run <code>await crypto.subtle.digest(...)</code> is annoying, so we ship a helper:
          </p>
          <pre className={styles.code}>
{`// In DevTools console:
// import { sha256Base64 } from "./services/security/passwordGate"
// Then:
await sha256Base64("your-new-password")`}
          </pre>
          <p className={styles.micro}>
            Paste the output into <code>src/config/appConfig.ts</code> as <code>ADMIN_PASSWORD_SHA256_BASE64</code>.
          </p>
        </details>
      </div>
    </div>
  );
}

