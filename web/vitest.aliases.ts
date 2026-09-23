import { readdirSync } from "node:fs"
import { fileURLToPath } from "node:url"

// Plain vitest has no Nuxt, so the aliases our sources import through are
// declared here, mirroring what Nuxt generates in `.nuxt/tsconfig.json`.
const web = (path: string): string => fileURLToPath(new URL(path, import.meta.url))

const layers = readdirSync(web("layers"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)

export const aliases: Record<string, string> = {
  ...Object.fromEntries(layers.map((name) => [`#layers/${name}`, web(`layers/${name}`)])),
  "#layers/mock-gopay": web("layers/shop/mock-gopay"),
  "#shared": web("shared"),
  "~": web("app"),
}
