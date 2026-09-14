# Implementation notes — Area 03: Catalog + Sales Pages

Short log for the maintainer: only what you have to act on or would be misled
without. Per-ticket entries appended by the orchestrator as tickets land.

## Run

- Clarity gate: the spec's Open Concerns are all deferred outside this area
  (launch-time fixture cleanup, area 04a's verification call, the unscheduled
  SimpleShop cutover). None changes what this run builds, so the run went
  ahead unattended rather than stopping for confirmation.
- The run executes in a cloud container. `web/.env` was written there from
  the container's environment (gitignored, never committed) so the probe
  config's `loadEnvFile` and `directus-sync` resolve tokens as documented.
