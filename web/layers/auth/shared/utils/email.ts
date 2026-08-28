// Directus matches e-mails case-insensitively at login but stores whatever it
// is handed, without normalising (measured in tests/probes/auth.probe.ts).
// Everything that sends an address to Directus, and everything that shows one
// back to a Student, goes through here — otherwise `Foo@x.cz` and `foo@x.cz`
// become two accounts, and registration could never report it because
// `POST /users/register` answers 204 either way.
export function normaliseEmail(raw: string): string {
  return raw.trim().toLowerCase()
}
