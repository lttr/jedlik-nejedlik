// The single seam onto nuxt-auth-utils' server API. Everything above it
// speaks Student (GLOSSARY.md); the module's `user`/`secure` key names stop
// here. Keep new uses of the module inside this file — the lint exemption it
// needs (see vite.config.ts) is scoped to it on purpose.
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
// expiry from the session's creation time and only a replaced session gets a
// fresh one. Replacing on every token refresh is what makes the 30 days slide
// with activity instead of counting down from the login.
export async function writeStudentSession(
  event: H3Event,
  student: Student,
  secrets: StudentSecrets,
): Promise<void> {
  await replaceUserSession(event, { user: student, secure: secrets })
}

export async function dropStudentSession(event: H3Event): Promise<void> {
  await clearUserSession(event)

  // Also strip the cookie from the *incoming* request. During SSR the module
  // re-reads the session through an internal fetch that forwards these
  // headers, so without this the page still renders as logged in from the
  // very cookie we just invalidated — logged out only from the next request.
  const cookieHeader = event.node.req.headers.cookie
  if (cookieHeader !== undefined) {
    const name = useRuntimeConfig(event).session.name
    event.node.req.headers.cookie = cookieHeader
      .split(";")
      .filter((part) => !part.trimStart().startsWith(`${name}=`))
      .join(";")
  }
}
