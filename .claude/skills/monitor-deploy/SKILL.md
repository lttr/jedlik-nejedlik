---
name: monitor-deploy
description: Monitor Coolify deployment of jedlik-nejedlik-production triggered by git push. Streams build logs, filters errors live, checks final status, and suggests fixes if deployment failed. Use when user says "monitor deploy", "watch deployment", "check deploy", or after pushing to master.
allowed-tools: Bash, Read, Monitor
---

# Monitor Deploy

App: `jedlik-nejedlik-production` — uuid `g8000og`. Deploy auto-triggers on push to `master`.

## Workflow

### 1. Wait for deployment to start (~5-15s after push)

Poll until latest deployment matches local `HEAD`:

```bash
git rev-parse HEAD
coolify app deployments list g8000og --format json | jq -r '.[0] | "\(.deployment_uuid) \(.status) \(.commit)"'
```

Sleep 5s and retry if commit is older. Cap retries ~60s.

### 2. Monitor with a watcher that always emits a terminal event

Critical: a watcher that only emits on error keywords goes silent on success — silence looks identical to "still running." Always emit when the deploy ends so you know to report.

`--follow` exits when the deploy finishes, so just append a sentinel `echo` after the pipeline. Run directly via `Monitor`:

```bash
coolify app deployments logs g8000og --follow 2>&1 \
  | rg --line-buffered -iN "error|failed|fatal|exception|cannot|unable to" \
  | rg --line-buffered -vN "error-(404|500)|errorhandler|error_page"
echo "DEPLOY_DONE"
```

- Coolify pipes docker progress to stderr, so filter by content not stream.
- Two `rg` stages: match error keywords, drop false positives (Nuxt error chunk filenames).
- `DEPLOY_DONE` is the guaranteed terminal notification — fetch the actual status in step 3.

### 3. On terminal event, fetch full final state

```bash
coolify deploy get <deployment-uuid> --format json | jq -r '{status, commit, commit_message, finished_at}'
```

Always report the outcome to the user — success or failure — once the `DEPLOY_DONE:` event arrives. Do not wait to be asked.

### 4. On fail, identify last successful deploy first

**Before diagnosing**, list recent deployments to find the last `finished` one. The breaking change is in commits _after_ it — not necessarily the most recent commit or the most obvious-looking one.

```bash
coolify app deployments list g8000og --format json | jq -r '.[] | "\(.status)\t\(.commit[0:8])\t\(.commit_message)"' | head -10
```

Then `git log <last-good>..HEAD --stat` to see exactly which files changed in the suspect range. Don't assume — a commit message like "Try wrong version of X" may only touch an unrelated file, while the real break sits in an earlier commit that _looked_ fine.

### 5. Dump stderr and analyze

```bash
coolify deploy get <deployment-uuid> --format json | jq -r '.logs | fromjson | .[] | select(.type=="stderr") | .output' | tail -200
```

Cross-reference the error against the diff from step 4. Map to project files (`nixpacks.toml`, `.node-version`, `pnpm-lock.yaml`, `web/`, `Dockerfile`), suggest concrete fix referencing the failing line. Quote error with timestamp.

## Notes

- Build logs vs runtime logs: for runtime errors after deploy, use `coolify app logs g8000og -f` instead.
- Coolify CLI has no server-side log filter — must filter client-side.
