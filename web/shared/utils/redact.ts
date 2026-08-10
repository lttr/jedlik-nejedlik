// Query parameters that are credentials in their own right. Directus mails
// single-use tokens as links to our pages (/nove-heslo, /registrace/overeni),
// so a reset token grants account takeover until it is used or expires.
const SENSITIVE_QUERY_PARAMS = ["token"]

const SENSITIVE_PARAM_PATTERN = new RegExp(
  `(^|[?&])(${SENSITIVE_QUERY_PARAMS.join("|")})=[^&#\\s]*`,
  "gi",
)

/**
 * Replace the value of any credential-bearing query parameter with `[redacted]`.
 *
 * Works on whole URLs and on bare query strings, and leaves everything that is
 * not a listed parameter untouched. Used to keep reset and verification tokens
 * out of error reporting: Sentry runs here with `sendDefaultPii: true` and full
 * trace sampling, so without this every visit to a reset link would ship the
 * token to a third party and keep it there for the retention window.
 */
export function redactSensitiveParams(value: string): string {
  return value.replace(SENSITIVE_PARAM_PATTERN, "$1$2=[redacted]")
}
