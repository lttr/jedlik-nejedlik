import type { Account } from "./account"

// Set by the `account-session` server middleware for every page render.
declare module "nuxt/schema" {
  interface RequestEventContext {
    account?: Account
  }
}
