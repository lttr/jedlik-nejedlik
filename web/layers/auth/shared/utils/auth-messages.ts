// Login messages stay vague: telling "no such account" apart from "wrong
// password" is the first step of enumerating accounts.
export const authMessages = {
  // Also the answer for an Unverified account: Directus returns the same 401
  // for it as for a wrong password (probe), so there is no hint to give.
  invalidCredentials: "Neplatný e-mail nebo heslo.",
  notLoggedIn: "Nejste přihlášeni.",
  tooManyLogins: "Příliš mnoho pokusů o přihlášení. Zkuste to prosím za chvíli.",
  unavailable: "Přihlášení je teď nedostupné. Zkuste to prosím za chvíli.",
  unexpected: "Něco se nepovedlo. Zkuste to prosím později.",

  // Registration. A duplicate address cannot be reported: Directus answers
  // 204 either way.
  invalidEmail: "Zadejte prosím platný e-mail.",
  // Must agree with PASSWORD_MIN_LENGTH; tests/unit/password.test.ts checks.
  passwordTooShort: "Heslo musí mít alespoň 8 znaků.",
  tooManyRegistrations: "Příliš mnoho pokusů o registraci. Zkuste to prosím za chvíli.",
  registrationUnavailable: "Registrace je teď nedostupná. Zkuste to prosím za chvíli.",

  // E-mail verification. A dead link is the one place a Student can be
  // stranded, so the message says what to do next.
  verificationFailed:
    "Odkaz pro ověření e-mailu je neplatný, už byl použit, nebo mu vypršela platnost.",
  verificationUnavailable: "Ověření e-mailu je teď nedostupné. Zkuste to prosím za chvíli.",
  tooManyVerifications: "Příliš mnoho pokusů o ověření. Zkuste to prosím za chvíli.",
  emailVerified: "E-mail je ověřený. Teď se můžete přihlásit.",

  // Password reset. Same text whether or not the address has an account:
  // Directus answers 204 either way.
  resetLinkSent:
    "Pokud u nás účet s touto adresou existuje, poslali jsme na ni odkaz pro nastavení nového hesla.",
  tooManyResetRequests: "Příliš mnoho žádostí o obnovu hesla. Zkuste to prosím za chvíli.",
  tooManyResets: "Příliš mnoho pokusů o nastavení nového hesla. Zkuste to prosím za chvíli.",
  resetRequestUnavailable: "Obnova hesla je teď nedostupná. Zkuste to prosím za chvíli.",
  // Expired, already used and forged all come back the same way.
  resetFailed: "Odkaz pro obnovu hesla je neplatný, už byl použit, nebo mu vypršela platnost.",
  resetUnavailable: "Nastavení nového hesla je teď nedostupné. Zkuste to prosím za chvíli.",
  passwordChanged: "Heslo je změněné. Teď se můžete přihlásit.",

  checkSpam: "Pokud zpráva do pár minut nedorazí, mrkněte se prosím i do spamu.",

  // Change from the account page. The Student is already logged in, so there
  // is no account to enumerate and the wrong current password can be named.
  currentPasswordWrong: "Současné heslo není správné.",
  passwordChangedHere: "Heslo bylo změněno. Na ostatních zařízeních jsme vás odhlásili.",
  passwordChangeUnavailable: "Změna hesla je teď nedostupná. Zkuste to prosím za chvíli.",
  passwordChangedLogInAgain:
    "Heslo bylo změněno, ale přihlášení se nepodařilo obnovit. Přihlaste se prosím znovu novým heslem.",
  tooManyPasswordChanges: "Příliš mnoho pokusů o změnu hesla. Zkuste to prosím za chvíli.",
} as const
