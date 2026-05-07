import { defineNitroPlugin, useRuntimeConfig } from "nitropack/runtime"

import { privateSchema, publicSchema } from "~~/server/runtime-config.schema"

// Validates resolved runtime config at every Nitro boot. Catches missing or
// malformed env vars that arrive after build (e.g. Coolify "restart with new
// env" flow that skips rebuild).
export default defineNitroPlugin(() => {
  const rc = useRuntimeConfig()
  const errors: string[] = []

  const publicResult = publicSchema.safeParse(rc.public)
  if (!publicResult.success) {
    for (const i of publicResult.error.issues) {
      errors.push(`public.${i.path.join(".") || "root"}: ${i.message}`)
    }
  }
  if (privateSchema) {
    const { public: _p, ...priv } = rc as Record<string, unknown>
    const r = privateSchema.safeParse(priv)
    if (!r.success) {
      for (const i of r.error.issues) {
        errors.push(`${i.path.join(".") || "root"}: ${i.message}`)
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Runtime config validation failed:\n${errors.map((e) => `  ${e}`).join("\n")}`)
  }
})
