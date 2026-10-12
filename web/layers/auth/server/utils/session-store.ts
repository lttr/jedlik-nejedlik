// The single seam onto the sealed session cookie. Everything else speaks
// Account and AccountSecrets and never touches the cookie itself.
import { clearSession, getCookie, getSession, updateSession } from "nuxt/server"
import type { RequestEvent, SessionConfig } from "nuxt/server"
import type { Account, AccountSecrets } from "#layers/auth/shared/types/account"

// A type, not an interface: the session API wants an index signature.
type AccountSessionData = {
  account?: Account
  secrets?: AccountSecrets
}

export interface StoredAccountSession {
  account: Account | undefined
  secrets: AccountSecrets | undefined
}

// Sealed with the default password, derived from `appSecret`
// (NUXT_APP_SECRET), under the default `nuxt-session` cookie name.
const SESSION = {
  name: "nuxt-session",
  // 30 days. Every write re-seals with a fresh lifetime, so the window slides
  // with each token refresh instead of counting down from login.
  maxAge: 30 * 24 * 60 * 60,
  // The cookie stays out of page scripts and plain HTTP (ADR 0002), so this
  // is stated here rather than left to the defaults.
  cookie: { httpOnly: true, secure: true, sameSite: "lax" },
} as const satisfies SessionConfig

export async function readAccountSession(event: RequestEvent): Promise<StoredAccountSession> {
  // Anonymous traffic stops here: reading a request with no session cookie
  // would mint an empty session and a `Set-Cookie` for it.
  if (getCookie(event, SESSION.name) === undefined) {
    return { account: undefined, secrets: undefined }
  }
  const { data } = await getSession<AccountSessionData>(event, SESSION)
  return { account: data.account, secrets: data.secrets }
}

export async function writeAccountSession(
  event: RequestEvent,
  account: Account,
  secrets: AccountSecrets,
): Promise<void> {
  await updateSession<AccountSessionData>(event, SESSION, { account, secrets })
}

export async function dropAccountSession(event: RequestEvent): Promise<void> {
  await clearSession(event, SESSION)
}
