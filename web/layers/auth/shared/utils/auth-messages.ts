// Every Czech string the auth flows show a Student. Login stays deliberately
// vague: telling "no such account" apart from "wrong password" is the first
// step of enumerating accounts.
export const authMessages = {
  // Also the answer for an Unverified account: the probe
  // (tests/probes/auth.probe.ts) confirmed Directus returns exactly the same
  // 401/INVALID_CREDENTIALS for a `status: unverified` user as for a wrong
  // password, so there is nothing to distinguish and no hint to give.
  invalidCredentials: "Neplatný e-mail nebo heslo.",
  notLoggedIn: "Nejste přihlášeni.",
  tooManyLogins: "Příliš mnoho pokusů o přihlášení. Zkuste to prosím za chvíli.",
  unavailable: "Přihlášení je teď nedostupné. Zkuste to prosím za chvíli.",
  unexpected: "Něco se nepovedlo. Zkuste to prosím později.",
} as const
