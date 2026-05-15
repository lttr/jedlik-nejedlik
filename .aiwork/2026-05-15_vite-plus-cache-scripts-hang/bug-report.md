# `run.cache.scripts: true` blocks on detached/unref'd grandchildren

vite-plus 0.1.20 / 0.1.21, Linux x64 (glibc), Node 24.15.0

## Summary

When `run.cache.scripts: true`, `vp run <script>` does not exit until **every** descendant process closes its fspy IPC channel — even processes the script started with `child_process.spawn(..., { detached: true, stdio: 'ignore' })` and `unref()`. Without the flag, vp exits as soon as the immediate script child exits.

Effect in CI: any tool the script invokes that forks a background helper (esbuild's `--service` daemon, sentry-cli sourcemap uploader, nitro/unimport workers, etc.) keeps the parent `vp` alive for as long as that helper runs. In Docker BuildKit (Coolify) the `RUN` step never returns and is killed by the Laravel queue worker after ~60 min.

## Minimal repro (~30 lines, no Nuxt, no sentry)

```bash
mkdir /tmp/vpx-repro && cd /tmp/vpx-repro

cat > package.json <<'EOF'
{
  "name": "vpx-repro",
  "private": true,
  "scripts": {
    "daemon": "node -e \"const cp=require('child_process');const c=cp.spawn('sleep',['30'],{detached:true,stdio:'ignore'});c.unref();console.log('parent done')\""
  }
}
EOF

# Bug repro
cat > vite.config.ts <<'EOF'
import { defineConfig } from "vite-plus"
export default defineConfig({ run: { cache: { scripts: true } } })
EOF
time vp run daemon
# real  0m30.190s   ← waits for the detached, unref'd, stdio:ignore'd grandchild

# Control
cat > vite.config.ts <<'EOF'
import { defineConfig } from "vite-plus"
export default defineConfig({})
EOF
time vp run daemon
# real  0m0.172s    ← exits immediately, as expected
```

175× slowdown on a script the OS considers finished in 100 ms.

## Mechanism (what strace shows)

`run.cache.scripts: true` runs the script through the Rust `runCommand` binding which uses **fspy** to fingerprint cache inputs. fspy ships an `LD_PRELOAD` shim at `/tmp/fspy/fspy_preload_<hash>.dylib` (ELF on Linux, despite the extension) and an IPC socket per process (`/tmp/fspy_ipc_<uuid>.lock`).

The preload is inherited by every descendant via the env. Each descendant opens a fspy IPC fd at startup. The fspy collector thread inside `vp` polls those fds with `epoll_wait(..., -1)` and only finishes when **every** fd reports `EPOLLHUP` (i.e. that descendant has died and the kernel closed its socket).

Strace excerpt of the repro (`sleep 5` variant):

```
887031 execve(... node -e "...spawn('sleep', ['5'], {detached:true,stdio:'ignore'}).unref()...")
887038 execve("/usr/bin/sleep", ["sleep", "5"], ...)
887031 +++ exited with 0 +++          ← script done, ~100ms
887028 epoll_wait(26, [], 1024, -1)   ← fspy collector blocks here
... 5 seconds pass ...
887038 +++ exited with 0 +++          ← detached sleep finally exits
887028 <... epoll_wait resumed>[{events=EPOLLHUP, ...}]
887028 +++ exited with 0 +++          ← vp exits
```

So `detached: true`, `unref()`, `stdio: 'ignore'` are all irrelevant — the LD_PRELOAD'd grandchild is still tied to the IPC socket and the collector waits on the socket, not on the process tree.

## Why it bites Coolify (real-world incident)

Repo: Nuxt 4 build (`nuxi build`) with `@sentry/nuxt` enabled. Locally `vp run build` exits in ~2 min because every Nuxt-side helper happens to terminate within seconds. In Coolify (BuildKit `RUN` step) one of the helpers (esbuild service, sentry-cli, or a nitro worker) lingers; BuildKit waits for `vp` which waits for the fspy fd; the step times out at 60 min. Bisected `cbdff08..552fb7f` to a single 3-line `cache.scripts: true` block. Removing it drops deploy time to ~105 s. Repo workaround commit: `2145eb9 Drop run.cache.scripts to fix Coolify build hang`.

## Suggested fix

Three options, ordered from least to most invasive:

1. **Timeout / grace period on the collector**: after the immediate script child has been reaped, give other fspy fds e.g. 5 s to drain, then close them on the parent side. Logs a warning naming the still-open processes so users can see what's leaking.
2. **Track only the script's direct child**: strip `LD_PRELOAD` (or set a per-pid filter) before exec. Anything the script forks itself is then invisible to fspy — at the cost of cache-fingerprint accuracy for child-process-side reads.
3. **Detach detection**: when fspy sees a child that calls `setsid()` or whose parent reparents to PID 1, close its IPC fd and exclude its accesses from the fingerprint. Closest to current semantics but more code.

Option 1 is the smallest change and would have prevented the Coolify incident outright (a 5-second tail vs. 60-minute hang).

## Environment

- vite-plus 0.1.20 (project-pinned) and 0.1.21 (~/.vite-plus/current) — both reproduce.
- Node 24.15.0 (the bundled `js_runtime`).
- Linux 6.18.7-76061807-generic (Pop!\_OS), x86_64, glibc.
- fspy preload: `/tmp/fspy/fspy_preload_15e0962a59b2c94723fed43f2bdaab1.dylib` (ELF 64-bit).
- IPC: `/tmp/fspy_ipc_*.lock` (lock files persist across runs — possibly another minor leak).
