import { z } from "zod"

// Helpers for authoring `server/runtime-config.schema.ts`. They hide the
// env-conditional plumbing so the schema reads as intent, not mechanics.

// Required at runtime (prod), tolerated-when-absent in dev. A *malformed*
// value still fails in both — only absence (empty string / undefined, which is
// how a missing runtimeConfig var arrives) is allowed locally.
export function devOptional(schema: z.ZodType): z.ZodType {
  return import.meta.dev ? z.union([z.literal(""), z.undefined(), schema]) : schema
}
