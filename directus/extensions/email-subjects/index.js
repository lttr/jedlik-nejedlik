/**
 * Czech subject lines for the transactional e-mails Directus sends.
 *
 * The bodies come from the templates in directus/templates/, but a subject
 * cannot be set from a template: neither `POST /auth/password/request` nor
 * `POST /users/invite` forwards a `subject` to the service and the
 * registration one is hardcoded, so the English defaults in
 * api/src/services/users.ts always win over the API. `email.send` is a filter
 * event — what it returns is what gets sent — so this is the one place a Czech
 * subject can be substituted.
 *
 * Keyed on `template.name`, not on the English subject text: the template name
 * is the stable identifier, the default subject is copy upstream changes (the
 * registration one is marked TODO there).
 *
 * The brand is not repeated here — MailService puts the project name in the
 * From display name.
 *
 * @typedef {{ name: string; data?: Record<string, unknown> }} EmailTemplate
 * @typedef {{ subject?: string; template?: EmailTemplate }} EmailPayload
 * @typedef {(event: string, handler: (payload: EmailPayload) => EmailPayload) => void} RegisterFilter
 */

/** @type {Record<string, string | undefined>} */
const SUBJECTS = {
  "user-registration": "Ověření e-mailu",
  "password-reset": "Obnovení hesla",
  "user-invitation": "Pozvánka do aplikace",
}

/** @param {{ filter: RegisterFilter }} hooks */
export default ({ filter }) => {
  filter("email.send", (payload) => {
    const name = payload.template?.name
    const subject = name === undefined ? undefined : SUBJECTS[name]

    // Mail that is not one of ours (Flows, other extensions) passes through.
    return subject === undefined ? payload : { ...payload, subject }
  })
}
