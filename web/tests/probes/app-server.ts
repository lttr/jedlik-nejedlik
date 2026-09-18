import { spawn } from "node:child_process"
import type { ChildProcess } from "node:child_process"
import { createServer } from "node:net"
import { fileURLToPath } from "node:url"

// The flow tests' seam: a real Nuxt server, driven with raw `fetch`. The
// probes next to this file talk to Directus directly; a payment flow cannot,
// because the settlement lives in Nitro. Same house style all the same — HTTP
// in, observable outcomes out, no Nuxt test framework in the lockfile.
//
// `NUXT_GOPAY_ENV=mock` is forced: the gateway page and its routes are only in
// the build in mock mode, and no other value works without GoPay credentials.

const WEB_ROOT = fileURLToPath(new URL("../..", import.meta.url))
const NUXI = fileURLToPath(new URL("../../node_modules/.bin/nuxi", import.meta.url))

// A cold `nuxi dev` plus the first SSR compile; generous because a slow
// machine failing here says nothing about the code.
const READY_TIMEOUT_MS = 180_000
const POLL_INTERVAL_MS = 500

export interface AppServer {
  url: string
  stop: () => Promise<void>
}

async function sleep(ms: number): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

// Asked of the OS and released again: `nuxi dev` would pick its own port on a
// clash and only say so in its log, which nothing here reads.
async function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer()
    server.on("error", reject)
    server.listen(0, "127.0.0.1", () => {
      const address = server.address()
      const port = typeof address === "object" && address !== null ? address.port : 0
      server.close(() => {
        resolve(port)
      })
    })
  })
}

async function waitForReady(url: string, child: ChildProcess): Promise<void> {
  const deadline = Date.now() + READY_TIMEOUT_MS
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`The dev server exited with code ${child.exitCode} before answering`)
    }
    const answered = await fetch(`${url}/api/courses`)
      .then((response) => response.ok)
      .catch(() => false)
    if (answered) {
      return
    }
    await sleep(POLL_INTERVAL_MS)
  }
  throw new Error(`The dev server did not answer on ${url} within ${READY_TIMEOUT_MS} ms`)
}

export async function startAppServer(): Promise<AppServer> {
  const port = await freePort()
  // `localhost`, never `127.0.0.1`: `nuxi dev` binds the hostname, which may
  // resolve to IPv6 only (run-jedlik-nejedlik skill).
  const url = `http://localhost:${port}`

  // Its own process group, so stopping it takes the compiler child with it.
  const child = spawn(NUXI, ["dev", "--port", String(port)], {
    cwd: WEB_ROOT,
    detached: true,
    stdio: "ignore",
    env: { ...process.env, NUXT_GOPAY_ENV: "mock" },
  })

  const stop = async (): Promise<void> => {
    if (child.pid !== undefined && child.exitCode === null) {
      try {
        process.kill(-child.pid, "SIGTERM")
      } catch {
        // Already gone; nothing to stop.
      }
    }
    await sleep(POLL_INTERVAL_MS)
  }

  try {
    await waitForReady(url, child)
  } catch (error) {
    await stop()
    throw error
  }
  return { url, stop }
}

// One browser's worth of cookies, which is all a flow test needs: the session
// cookie the login route seals and hands back.
export class CookieJar {
  private readonly cookies = new Map<string, string>()

  remember(response: Response): void {
    for (const header of response.headers.getSetCookie()) {
      const pair = header.split(";")[0]
      const separator = pair.indexOf("=")
      if (separator > 0) {
        this.cookies.set(pair.slice(0, separator), pair.slice(separator + 1))
      }
    }
  }

  header(): string {
    return [...this.cookies].map(([name, value]) => `${name}=${value}`).join("; ")
  }
}
