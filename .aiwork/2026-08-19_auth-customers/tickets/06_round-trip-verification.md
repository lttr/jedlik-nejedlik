---
status: ready
blocked_by: [03, 04, 05]
references:
  - "Spec: ../spec.md"
---

# 06 — Full round-trip verification

**What to build:** the area's verify criterion, proven on production:
register → verification e-mail → activate → login → logout → login →
reset e-mail → new password → login → change password. Documents the
outcome and closes the area.

## Acceptance criteria

- [ ] Documented manual round-trip completed, including **both** e-mail
      legs (verification and reset); Czech rendering of each checked
      (template override opened as follow-up only if poor)
- [ ] Full probe suite (area 01's + auth probes) green twice
      consecutively, self-cleaning
- [ ] Implementation notes written per the aiwork protocol (deviations,
      instance changes actually applied, follow-ups)

## Rework notes

Verification the previous run skipped — all reachable, do them:

- [ ] Exercise the flows in a **real browser** (`aiwork:agent-browser`
      skill): submit handlers, client-side password check, errors
      rendering in the DOM, hydration warnings — not curl-only
- [ ] Test `safeRedirectPath` **as shipped** (import the real export):
      `//host`, `/\host`, `/\/host`, absolute URLs, `javascript:`,
      control characters, non-string inputs
- [ ] Forge a refresh cookie (or the session cookie's equivalent) and
      hit a page: refresh-failure path, session clearing, real
      `Set-Cookie` flags
- [ ] Prove the rate-limit window **releases**, not just that it closes
- [ ] `vp run directus:probe` with `DIRECTUS_PROBE_ADMIN_TOKEN`
      (no service token exists any more), sandbox disabled, twice
      consecutively

Process gotchas for the session doing this work:

- The pre-commit hook does not exist in a fresh checkout —
  `core.hooksPath` points at the generated `.vite-hooks/_`, created by
  `pnpm install` → `prepare: vp config`. Install before committing or
  nothing formats/lints, silently.
- No `git add -A` — stage explicit paths. Use `git commit -F <file>`;
  a heredoc on stdin hung against the hook.
- Never a password literal in a probe, even for a throwaway user —
  generate per run (GitGuardian scans PR history).
- Sandbox builds need `NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt`,
  or `@nuxt/fonts` dies on `SELF_SIGNED_CERT_IN_CHAIN`.
- `vp build` does not work; use `vp run build`. `vp run check:all` is
  the full gate (the `verify:*` tasks were renamed to `check:*`). Nitro
  no longer needs any service token; it does need `NUXT_SESSION_PASSWORD`,
  which nuxt-auth-utils auto-generates in dev.
