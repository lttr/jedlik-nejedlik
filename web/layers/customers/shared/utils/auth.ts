import { z } from "zod"

// Auth payload codecs, shared by the client forms and the Nitro routes so the
// server never trusts an unvalidated body. Password floor mirrors the Directus
// instance policy (`auth_password_policy = /^.{8,}$/`).

export const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
})
export type Credentials = z.infer<typeof credentialsSchema>

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  first_name: z.string().trim().min(1).optional(),
  last_name: z.string().trim().min(1).optional(),
})
export type RegisterInput = z.infer<typeof registerSchema>

export const passwordRequestSchema = z.object({
  email: z.email(),
})
export type PasswordRequestInput = z.infer<typeof passwordRequestSchema>

export const passwordResetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
})
export type PasswordResetInput = z.infer<typeof passwordResetSchema>

// The end-user identity as the app consumes it. `email` is the identity (O-17);
// names are optional profile fields.
export interface SessionUser {
  id: string
  email: string
  first_name?: string
  last_name?: string
}
