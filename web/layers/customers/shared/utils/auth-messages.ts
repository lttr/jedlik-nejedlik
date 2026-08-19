// Directus enforces this via `auth_password_policy` (/^.{8,}$/); the app
// mirrors it so the Student hears about it before submitting.
export const PASSWORD_MIN_LENGTH = 8

// Every Czech string the auth flows can show. Login stays deliberately vague
// (an account must not be enumerable); registration may be specific.
export const authMessages = {
  emailInvalid: "Zadejte prosím platnou e-mailovou adresu.",
  emailTaken: "Tento e-mail už je zaregistrovaný. Přihlaste se prosím.",
  invalidCredentials: "Neplatný e-mail nebo heslo.",
  notLoggedIn: "Nejste přihlášeni.",
  passwordTooShort: `Heslo musí mít alespoň ${PASSWORD_MIN_LENGTH} znaků.`,
  tooManyRegistrations: "Příliš mnoho pokusů o registraci. Zkuste to prosím za chvíli.",
  unexpected: "Něco se nepovedlo. Zkuste to prosím později.",
} as const
