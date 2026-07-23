import { readMe } from "@directus/sdk"

import type { SessionUser } from "../../../shared/utils/auth"

// Resolve the current session for SSR hydration. `{ user: null }` when anonymous
// (or when a stale refresh token fails to renew — the cookies get cleared).
export default defineEventHandler(async (event): Promise<{ user: SessionUser | null }> => {
  const client = await getAuthedClient(event)
  if (!client) {
    return { user: null }
  }

  try {
    const me = await client.request(readMe({ fields: ["id", "email", "first_name", "last_name"] }))
    return { user: toSessionUser(me) }
  } catch {
    clearAuthCookies(event)
    return { user: null }
  }
})
