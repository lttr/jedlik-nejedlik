# safe-runtime-config

Validates resolved Nuxt `runtimeConfig` against a Zod schema on **every Nitro
boot**. Catches env vars gone missing or malformed after the build (e.g. Coolify
"restart with new env"). Throws a readable error at boot rather than failing
confusingly later. Not done at build time because the build can't see the
runtime env.

## Authoring

Provide `<rootDir>/server/runtime-config.schema.ts` exporting `publicSchema` and
`privateSchema`. The runtime plugin imports it via `~~` and validates at boot.

```ts
import type { z } from "zod"
import { definePublicSchema, url } from "../modules/safe-runtime-config/runtime/schema-kit"

const directusUrlSchema = url("NUXT_PUBLIC_DIRECTUS_URL")

export const publicSchema = definePublicSchema({
  directusUrl: directusUrlSchema,
})

// `undefined` if no private (server-only) keys need validating.
export const privateSchema: z.ZodType | undefined = undefined

declare module "nuxt/schema" {
  interface SharedPublicRuntimeConfig {
    directusUrl: z.infer<typeof directusUrlSchema>
  }
}
```

## Helpers

- `url(envName)` — required, branded-`Url` field. Distinct messages for missing
  (`""`/undefined) vs malformed. The `""` default in `nuxt.config` is only a
  placeholder so the env override has a key to target, the value comes from env.
- `definePublicSchema(fields)` — wraps in `z.looseObject` (other modules' keys
  pass through, only declared keys validated). Its generic constraint is a
  compile-time key-drift guard: a key that isn't a real `PublicRuntimeConfig` key
  (e.g. `directusUrl` → `directusurl`) fails to compile instead of becoming a
  misleading boot-time "is missing".

## Branding

Augmenting `SharedPublicRuntimeConfig` with `z.infer<typeof fieldSchema>` makes
`useRuntimeConfig().public.<key>` read as the brand (e.g. `Url`) app-wide. Sound
because boot refuses to start on an invalid value, so consumers read it directly
without re-parsing.
