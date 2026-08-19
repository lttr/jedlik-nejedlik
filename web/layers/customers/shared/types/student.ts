// A Student is a Directus end-user identity (see GLOSSARY.md) — never call it
// user or account in code. v1 knows only the e-mail; names arrive at checkout.
export interface Student {
  id: string
  email: string
}

declare module "h3" {
  interface H3EventContext {
    // Resolved by the customers layer's Nitro middleware for page requests.
    student?: Student | null
  }
}
