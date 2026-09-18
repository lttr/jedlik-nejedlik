import type { RestCommand } from "@directus/sdk"

import type { Schema } from "../../../directus/shared/types/directus"

// The `limit: 1` read every shop query makes, with its `rows[0]` unwrapping in
// one place. Two functions, because the one difference that matters between
// the call sites is whether an absent row is an answer or a 404.

// The row, or `undefined` when the filter matched nothing.
export async function readFirstRow<T>(
  client: DirectusRestClient,
  command: RestCommand<T[], Schema>,
): Promise<T | undefined> {
  const rows = await client.request(command)
  return rows[0]
}

// The row, or the shop's 404 — which is what makes a row the caller may not
// read indistinguishable from one that never existed (ADR 0004).
export async function readOnlyRow<T>(
  client: DirectusRestClient,
  command: RestCommand<T[], Schema>,
): Promise<T> {
  const row = await readFirstRow(client, command)
  if (row === undefined) {
    throw notFound()
  }
  return row
}
