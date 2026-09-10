/**
 * Hosts whose traffic must never reach analytics or ad tools: local development
 * and the test site. Shared by the Plausible config (nuxt.config) and the Meta
 * Pixel gate (plugins/meta-pixel.client.ts) so the two cannot drift apart.
 */
export const IGNORED_HOSTNAMES = ["localhost", "jedlik-nejedlik-test.lttr.cz"]
