import type { Nuxt } from "@nuxt/schema"
import { fileURLToPath } from "node:url"

// Authoring helpers re-exported from the module root so consumers import them
// from "../modules/safe-runtime-config", not a deep runtime/ path. The module
// must stay free of `@nuxt/kit` *value* imports: the consumer's schema (which
// re-exports from here) is pulled into the Nitro server graph, where Nuxt's
// impound plugin forbids `@nuxt/kit`. Hence a plain function module + the
// type-only `Nuxt` import (erased at build) instead of `defineNuxtModule`.
export { definePublicSchema, url } from "./runtime/schema-kit"
export type { FieldOptions, Url } from "./runtime/schema-kit"

// Convention: consumer must provide `<rootDir>/server/runtime-config.schema.ts`
// exporting `publicSchema` and (optionally) `privateSchema`. Registers a Nitro
// plugin that imports it (via the `~~` alias) and validates at every boot.
export default function safeRuntimeConfig(_options: unknown, nuxt: Nuxt): void {
  const plugin = fileURLToPath(new URL("./runtime/plugin", import.meta.url))
  nuxt.options.nitro.plugins ??= []
  nuxt.options.nitro.plugins.push(plugin)
}
safeRuntimeConfig.meta = { name: "safe-runtime-config" }
