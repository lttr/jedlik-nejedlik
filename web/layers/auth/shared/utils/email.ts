// Directus matches e-mails case-insensitively at login but stores them
// verbatim (probe). Without this `Foo@x.cz` and `foo@x.cz` become two
// accounts, and registration could never report it: it answers 204 either way.
export function normaliseEmail(raw: string): string {
  return raw.trim().toLowerCase()
}
