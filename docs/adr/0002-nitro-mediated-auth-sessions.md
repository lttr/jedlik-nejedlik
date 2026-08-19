# Auth sessions are Nitro-mediated; the browser never holds Directus credentials

## Context

Students authenticate with native Directus e-mail + password, but
Directus lives on `obsah-jedlika.lttr.cz` — a different registrable domain
than `www.jedlik-nejedlik.cz`. Directus's own session cookies would
therefore be third-party cookies in the browser, which modern browsers
(Safari ITP, Chrome's third-party phase-out) make unreliable. The obvious
alternatives were moving Directus to a `jedlik-nejedlik.cz` subdomain to
share cookies natively, or exposing Directus tokens to client-side
JavaScript.

## Decision

All auth flows go through Nitro routes in the `web/` app: login, refresh,
logout, registration (via a dedicated service token with a
create-Student-users-only policy — Directus `public_registration` stays
off), and the password-reset request. Directus access + refresh tokens are
stored in `httpOnly` cookies on the site's own domain; Nitro refreshes
transparently server-side. Authenticated Directus reads happen only during
SSR or in Nitro routes via a per-request client built from the cookie
(`getDirectusServerClient(event)`); the browser keeps using the anonymous
client for public content and never talks to Directus with credentials.

## Why

No infra migration, no third-party-cookie fragility, and tokens stay out of
reach of XSS. It matches where the platform is headed anyway: the video
signed video playback tokens and gated material delivery are (or will be)
Nitro endpoints too. Moving Directus to a subdomain remains possible later
without changing the app-facing shape.

Password-reset e-mails stay Directus-native (not custom Mailgun sends from
Nitro) because Directus never exposes the reset token to API callers — it
generates the signed single-use token and sends the e-mail itself.
Rebuilding that token lifecycle just to customize an e-mail body is not
worth the security surface; the Liquid template on the instance can be
overridden instead.
