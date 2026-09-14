# Course pages read through Nitro, not from the browser

## Context

Marketing pages read Directus directly in the browser with the anonymous
client, and the catalog could do the same: published Courses are public.
That leaves an Author unable to see a draft Course rendered as a page. The
browser client is anonymous, and the public policy filters on
`status = published`, so a draft is indistinguishable from a missing one.

## Decision

The Catalog and the Sales Page fetch their data from a Nitro route that
builds its Directus client from the caller's own session, falling back to
the anonymous client when nobody is logged in. Directus decides what comes
back: an Author or Admin sees drafts, a Student or a visitor sees published
Courses only. The Catalog marks a draft card with a „Koncept" badge.

## Why

Preview costs one route and no new Course permissions, though reading with
the session did need Student and Autor to get their own copy of the Public
policy's `directus_files` rule: the Public policy does not apply to a
logged-in request, so without it a cover is unreadable. Enforcement stays in
Directus, which is the platform's authorization boundary, instead of app
code deciding who may see a draft. The alternative was a service account
holding a token, reached through a secret preview URL. That would bring a
service account into the platform before the payment flow needs one and
add a second authorization path for one editorial convenience.

## Consequences

The response varies by session, so these pages cannot be shared-cached at
the edge or pre-rendered with ISR. Nothing caches them today, so the cost
is a foreclosed option rather than a regression. If caching is ever
needed, the split is a cached public page plus a client-side draft overlay
for logged-in Authors.
