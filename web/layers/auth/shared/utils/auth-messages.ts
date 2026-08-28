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

  // Registration. The e-mail is the only thing worth complaining about
  // specifically — a duplicate address cannot be reported at all, because
  // Directus answers 204 either way to keep accounts unenumerable.
  invalidEmail: "Zadejte prosím platný e-mail.",
  // The number must stay in step with PASSWORD_MIN_LENGTH in password.ts;
  // tests/unit/password.test.ts asserts the two agree.
  passwordTooShort: "Heslo musí mít alespoň 8 znaků.",
  tooManyRegistrations: "Příliš mnoho pokusů o registraci. Zkuste to prosím za chvíli.",
  registrationUnavailable: "Registrace je teď nedostupná. Zkuste to prosím za chvíli.",

  // E-mail verification. A dead link is the one place a Student can be
  // stranded, so the message says what to do next (story 31); the page adds
  // the links.
  verificationFailed:
    "Odkaz pro ověření e-mailu je neplatný, už byl použit, nebo mu vypršela platnost.",
  verificationUnavailable: "Ověření e-mailu je teď nedostupné. Zkuste to prosím za chvíli.",
  tooManyVerifications: "Příliš mnoho pokusů o ověření. Zkuste to prosím za chvíli.",
  emailVerified: "E-mail je ověřený. Teď se můžete přihlásit.",

  // Password reset. The request leg says the same thing whether or not the
  // address has an account — Directus deliberately answers 204 either way, so
  // there is nothing else it could honestly say.
  resetLinkSent:
    "Pokud u nás účet s touto adresou existuje, poslali jsme na ni odkaz pro nastavení nového hesla.",
  tooManyResetRequests: "Příliš mnoho žádostí o obnovu hesla. Zkuste to prosím za chvíli.",
  tooManyResets: "Příliš mnoho pokusů o nastavení nového hesla. Zkuste to prosím za chvíli.",
  resetRequestUnavailable: "Obnova hesla je teď nedostupná. Zkuste to prosím za chvíli.",
  // Expired, already used and forged all come back the same way, so this
  // covers all three; the page adds the way to ask for a fresh link.
  resetFailed: "Odkaz pro obnovu hesla je neplatný, už byl použit, nebo mu vypršela platnost.",
  resetUnavailable: "Nastavení nového hesla je teď nedostupné. Zkuste to prosím za chvíli.",
  passwordChanged: "Heslo je změněné. Teď se můžete přihlásit.",

  // Both flows end with "we sent you an e-mail", and both have to say this.
  checkSpam: "Pokud zpráva do pár minut nedorazí, mrkněte se prosím i do spamu.",
} as const
