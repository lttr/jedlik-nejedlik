// Runtime config schema for the @lttr/nuxt-validated-runtime-config module. See
// that module's README for the authoring conventions and the why behind each
// piece.
import { z } from "zod"

import { definePublicSchema, url } from "@lttr/nuxt-validated-runtime-config/schema"
import type { Url } from "@lttr/nuxt-validated-runtime-config/schema"

export const publicSchema = definePublicSchema({
  coursesPublic: z.boolean(),
  directusUrl: url("DIRECTUS_URL", { public: true }),
})

const GOPAY_CREDENTIAL_ENV_VARS: Record<string, string> = {
  goid: "NUXT_GOPAY_GOID",
  clientId: "NUXT_GOPAY_CLIENT_ID",
  clientSecret: "NUXT_GOPAY_CLIENT_SECRET",
}

// The payment gateway. `mock` is a development fixture (layers/shop/mock-gopay)
// that a production build does not even contain, so it is refused there
// however the environment is set; sandbox and production need credentials,
// mock needs none.
const gopaySchema = z
  .looseObject({
    env: z.enum(["mock", "sandbox", "production"], {
      error: "NUXT_GOPAY_ENV must be one of: mock, sandbox, production",
    }),
    // Nuxt puts every env override through `destr`, so an all-digits GoID or
    // client id arrives as a number however the default is typed. The client
    // turns them back into text.
    goid: z.union([z.string(), z.number()]),
    clientId: z.union([z.string(), z.number()]),
    clientSecret: z.union([z.string(), z.number()]),
  })
  .superRefine((gopay, ctx) => {
    if (gopay.env === "mock") {
      if (!import.meta.dev) {
        ctx.addIssue({ code: "custom", message: "NUXT_GOPAY_ENV=mock is refused in production" })
      }
      return
    }
    for (const [key, envVar] of Object.entries(GOPAY_CREDENTIAL_ENV_VARS)) {
      if (gopay[key] === "") {
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: `${envVar} is required when NUXT_GOPAY_ENV is ${gopay.env}`,
        })
      }
    }
  })

export const privateSchema: z.ZodType | undefined = z.looseObject({
  gopay: gopaySchema,
  shop: z.looseObject({
    // The Shop Service Account's static Directus token (ADR 0006). Without it
    // no Payment can be stamped onto an Order and no Entitlement granted, so
    // an empty one is a boot failure rather than a runtime surprise.
    directusToken: z.string().min(1, { error: "NUXT_SHOP_DIRECTUS_TOKEN is required" }),
  }),
  session: z.looseObject({
    password: z.string().min(32, { error: "NUXT_SESSION_PASSWORD must be at least 32 characters" }),
  }),
})

declare module "nuxt/schema" {
  interface PublicRuntimeConfig {
    coursesPublic: boolean
    // `url()` brands its output as `Url`; keep the augmentation in sync by hand.
    directusUrl: Url
  }
}
