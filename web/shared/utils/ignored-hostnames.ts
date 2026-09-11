/**
 * Hosts whose traffic must never reach analytics or ad tools: local development
 * and the test site. Shared by the Plausible config (nuxt.config) and the Meta
 * Pixel gate (plugins/meta-pixel.client.ts) so the two cannot drift apart.
 *
 * `127.0.0.1` is here because a local production build (`vp run build` plus
 * `node .output/server/index.mjs`) is not `import.meta.dev`: served under that
 * hostname it would otherwise load the real pixel and send real events.
 */
export const IGNORED_HOSTNAMES = ["localhost", "127.0.0.1", "jedlik-nejedlik-test.lttr.cz"]
