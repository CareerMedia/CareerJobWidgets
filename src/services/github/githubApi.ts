import { GITHUB_REPO_SLUG } from "../../config/appConfig";

export class GitHubApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "GitHubApiError";
  }
}

function headers(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string };
    return data.message ?? `GitHub API error (${res.status})`;
  } catch {
    return `GitHub API error (${res.status})`;
  }
}

export async function verifyGitHubToken(
  token: string,
): Promise<{ ok: true; login: string } | { ok: false; message: string }> {
  const res = await fetch("https://api.github.com/user", { headers: headers(token) });
  if (!res.ok) return { ok: false, message: await readErrorMessage(res) };
  const data = (await res.json()) as { login?: string };
  return { ok: true, login: data.login ?? "unknown" };
}

export async function dispatchWorkflow(
  workflowFile: string,
  inputs: Record<string, string>,
  token: string,
): Promise<void> {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO_SLUG}/actions/workflows/${workflowFile}/dispatches`,
    {
      method: "POST",
      headers: headers(token),
      body: JSON.stringify({ ref: "main", inputs }),
    },
  );
  if (res.status === 204) return;
  throw new GitHubApiError(await readErrorMessage(res), res.status);
}

type WorkflowRun = {
  id: number;
  status: string;
  conclusion: string | null;
  created_at: string;
};

/** Wait for the most recent workflow_dispatch run started after `startedAfter`. */
export async function waitForWorkflowSuccess(
  workflowFile: string,
  token: string,
  startedAfter: Date,
  timeoutMs = 300_000,
): Promise<"success" | "failure" | "timeout"> {
  const start = Date.now();
  let runId: number | null = null;

  while (Date.now() - start < timeoutMs) {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO_SLUG}/actions/workflows/${workflowFile}/runs?event=workflow_dispatch&per_page=5`,
      { headers: headers(token) },
    );
    if (res.ok) {
      const data = (await res.json()) as { workflow_runs?: WorkflowRun[] };
      const run = data.workflow_runs?.find((r) => new Date(r.created_at) >= startedAfter);
      if (run) {
        runId = run.id;
        if (run.status === "completed") {
          return run.conclusion === "success" ? "success" : "failure";
        }
      }
    }
    await new Promise((r) => window.setTimeout(r, 4000));
  }

  if (runId) {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO_SLUG}/actions/runs/${runId}`, {
      headers: headers(token),
    });
    if (res.ok) {
      const run = (await res.json()) as WorkflowRun;
      if (run.status === "completed") return run.conclusion === "success" ? "success" : "failure";
    }
  }

  return "timeout";
}

type ContentsResponse = {
  sha: string;
  content?: string;
};

export async function readRepoFile(path: string, token: string): Promise<{ sha: string; content: string } | null> {
  const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO_SLUG}/contents/${path}`, {
    headers: headers(token),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new GitHubApiError(await readErrorMessage(res), res.status);
  const data = (await res.json()) as ContentsResponse;
  if (!data.content) throw new GitHubApiError("GitHub file response missing content.");
  const content = atob(data.content.replace(/\n/g, ""));
  return { sha: data.sha, content };
}

export async function writeRepoFile(
  path: string,
  content: string,
  message: string,
  token: string,
  sha?: string,
): Promise<void> {
  const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO_SLUG}/contents/${path}`, {
    method: "PUT",
    headers: headers(token),
    body: JSON.stringify({
      message,
      content: btoa(unescape(encodeURIComponent(content))),
      sha,
    }),
  });
  if (!res.ok) throw new GitHubApiError(await readErrorMessage(res), res.status);
}
