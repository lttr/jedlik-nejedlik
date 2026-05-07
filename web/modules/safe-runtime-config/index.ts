import { addServerPlugin, createResolver, defineNuxtModule } from "@nuxt/kit"

// Convention: consumer must provide `<rootDir>/server/runtime-config.schema.ts`
// exporting `publicSchema` and (optionally) `privateSchema`. The runtime
// plugin imports it via Nuxt's `~~` alias.
export default defineNuxtModule({
  meta: {
    name: "safe-runtime-config",
  },
  setup() {
    const resolver = createResolver(import.meta.url)
    addServerPlugin(resolver.resolve("./runtime/plugin"))
  },
})
