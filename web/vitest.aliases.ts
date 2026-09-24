import { fileURLToPath } from "node:url"

// Plain vitest has no Nuxt, so the aliases our sources import through are
// declared here, mirroring what Nuxt generates in `.nuxt/tsconfig.json`.
// A string alias matches as a prefix: `#layers` covers every `#layers/<name>`.
const web = (path: string): string => fileURLToPath(new URL(path, import.meta.url))

export const aliases: Record<string, string> = {
  "#layers": web("layers"),
  "#shared": web("shared"),
  "~": web("app"),
}
