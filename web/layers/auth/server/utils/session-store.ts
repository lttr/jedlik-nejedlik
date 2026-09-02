// The single seam onto nuxt-auth-utils' server API; its `user`/`secure` key
// names stop here. Keep new uses of the module in this file: the lint
// exemption in vite.config.ts is scoped to it.
import type { H3Event } from "h3"
import type { Student, StudentSecrets } from "../../shared/types/student"

export interface StoredStudentSession {
  student: Student | undefined
  secrets: StudentSecrets | undefined
}

export async function readStudentSession(event: H3Event): Promise<StoredStudentSession> {
  const { user, secure } = await getUserSession(event)
  return { student: user, secrets: secure }
}

// `replaceUserSession`, not `setUserSession`: h3 derives the sealed cookie's
// expiry from the session's creation time, so only replacing on every token
// refresh makes the 30 days slide instead of counting down from login.
export async function writeStudentSession(
  event: H3Event,
  student: Student,
  secrets: StudentSecrets,
): Promise<void> {
  await replaceUserSession(event, { user: student, secure: secrets })
}

export async function dropStudentSession(event: H3Event): Promise<void> {
  await clearUserSession(event)

  // Also strip the cookie from the incoming request: during SSR the module
  // re-reads the session through an internal fetch that forwards these
  // headers, and the page would still render as logged in.
  const cookieHeader = event.node.req.headers.cookie
  if (cookieHeader !== undefined) {
    const name = useRuntimeConfig(event).session.name
    event.node.req.headers.cookie = cookieHeader
      .split(";")
      .filter((part) => !part.trimStart().startsWith(`${name}=`))
      .join(";")
  }
}
