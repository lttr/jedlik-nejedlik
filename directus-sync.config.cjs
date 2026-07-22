// directus-sync (https://github.com/tractr/directus-sync) — PULL-ONLY.
//
// The production Directus instance is the source of truth; this repo keeps a
// committed, diffable dump of its configuration (roles, policies, permissions,
// flows, settings, …) plus the schema snapshot under `directus/config/`.
//
// Workflow: `vp run directus:pull` to refresh the dump, `vp run directus:diff`
// to detect drift. Push is intentionally not part of the workflow.
//
// Auth: set the `DIRECTUS_TOKEN` env var to an admin token at runtime.
// Never commit tokens.
module.exports = {
  directusUrl: "https://obsah-jedlika.lttr.cz",
  dumpPath: "./directus/config",
  // Stable key order → reviewable git diffs.
  sortJson: true,
  // GraphQL/OpenAPI specs are derived artifacts, not configuration — skip.
  specs: false,
  // Flow operations embed live third-party API keys in request headers
  // (e.g. the Ecomail key), and `diff` compares raw instance data, so a
  // redact-on-dump hook would keep `diff` permanently dirty. Excluded to
  // keep secrets out of git. Revisit if the keys move to FLOWS_ENV_ALLOW_LIST
  // env variables on the instance.
  excludeCollections: ["operations"],
}
