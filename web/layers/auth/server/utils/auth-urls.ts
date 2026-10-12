import { SITE_URL } from "#layers/base/shared/utils/site"

// Absolute URL of one of our pages, for Directus to put in an e-mail or GoPay
// to call back. Built from the site URL rather than the request origin, so a
// forged Host header cannot steer where it points.
export function authPageUrl(path: string): string {
  return new URL(path, SITE_URL).href
}
