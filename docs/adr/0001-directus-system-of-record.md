# Directus is the system of record and the enforcement boundary for the course platform

## Context

The course platform needs server-enforced access to paid content ("user ×
course × progress"), authentication for students, payment + invoicing, and
secure video. The obvious shape would be a dedicated backend service with its
own database owning identity and transactional data, with Directus relegated to
content authoring.

## Decision

Directus is the single system of record for **both** content and transactional
data (students, orders, entitlements, progress, test attempts) **and** the
identity / auth provider. Directus permissions are the primary access gate.

A Nitro layer (in this repo) is a permitted but secondary **trusted compute
layer**, used only for operations that need a secret or server-side logic:
signing video URLs, handling the GoPay webhook, calling Fakturoid, and LLM
grading of open answers. It reads/writes Directus with a service account and
never becomes a second store of record. Where a Directus extension or Flow is
the more convenient home for such an operation, that is equally acceptable.

## Why

The whole solution is small and run by the same people who already operate the
Directus CMS. A separate backend with its own DB doubles the identity, data, and
ops surface for no proportional benefit at this scale. Keeping one store and one
auth provider is the simplest thing that works; a little extra coupling is
acceptable and the shop may even live inside the existing `web/` app.

## Consequences

- The same Directus instance is consumed client-side by the public marketing
  site. The student-facing permission surface must be configured so a misconfig
  cannot leak paid content to the public role. This is the main risk the
  decision accepts.
- Reversible-ish: if scale or a second consumer later demands it, transactional
  data can be split into a dedicated DB behind the Nitro layer without changing
  the student-facing contract.
