// Shared plumbing for the on-demand Directus permission probes. The probes
// hit the production instance and assert externally observable access
// behaviour per role — what each token can read or write — never Directus
// internals. Run via `vp run directus:probe`; they are intentionally not
// part of the default test run.

import { expect } from "vitest"

export const DIRECTUS_URL = "https://obsah-jedlika.lttr.cz"

// Stable [TEST] fixture identifiers on the production instance (not secrets).
// See .aiwork/2026-07-22_directus-data-model/implementation-notes.md.
export const ENTITLED_ID = "42ea0c6c-9e85-4ae1-a63d-336dc63a8b54"
export const UNENTITLED_ID = "70975566-e359-4d67-9bf7-81d69d5b8a79"
export const PUBLISHED_COURSE_ID = 1
export const PUBLISHED_SLUG = "test-kurz-publikovany"
export const DRAFT_SLUG = "test-kurz-draft"
export const MATERIAL_FILE_ID = "c1cee206-b8e2-41fb-975c-862b84f65a84"
export const MATERIALS_FOLDER_ID = "6173b74f-9990-41a2-b931-ff591ee6a5ed"

export interface ProbeResponse {
  status: number
  body: {
    data?: unknown
    errors?: { message?: string; extensions?: { code?: string } }[]
  }
}

// GET an API path; without a token the request is anonymous (public role).
export async function probe(path: string, token?: string): Promise<ProbeResponse> {
  const response = await fetch(`${DIRECTUS_URL}${path}`, {
    headers: token === undefined ? {} : { Authorization: `Bearer ${token}` },
  })
  return { status: response.status, body: (await response.json()) as ProbeResponse["body"] }
}

// Mutating request (POST/PATCH/DELETE) with a JSON payload.
export async function probeSend(
  method: "POST" | "PATCH" | "DELETE",
  path: string,
  body: unknown,
  token?: string,
): Promise<ProbeResponse> {
  const response = await fetch(`${DIRECTUS_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token === undefined ? {} : { Authorization: `Bearer ${token}` }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await response.text()
  return {
    status: response.status,
    body: text === "" ? {} : (JSON.parse(text) as ProbeResponse["body"]),
  }
}

// Multipart file upload (POST /files). Field order matters to Directus:
// scalar metadata first, the binary part last.
export async function probeUpload(
  token: string,
  file: { name: string; content: string; type: string },
  fields: Record<string, string> = {},
): Promise<ProbeResponse> {
  const form = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    form.append(key, value)
  }
  form.append("file", new Blob([file.content], { type: file.type }), file.name)
  const response = await fetch(`${DIRECTUS_URL}/files`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
  return { status: response.status, body: (await response.json()) as ProbeResponse["body"] }
}

// Raw GET (e.g. /assets file downloads) where only the status matters.
export async function probeStatus(path: string, token?: string): Promise<number> {
  const response = await fetch(`${DIRECTUS_URL}${path}`, {
    headers: token === undefined ? {} : { Authorization: `Bearer ${token}` },
  })
  await response.arrayBuffer()
  return response.status
}

// Role tokens for authenticated probes (student/author tickets): supply
// them via environment, e.g. DIRECTUS_PROBE_STUDENT_TOKEN. Never commit
// tokens.
export function roleToken(envVar: string): string {
  const value = process.env[envVar]
  if (value === undefined || value === "") {
    throw new Error(`Probe requires the ${envVar} environment variable`)
  }
  return value
}

// Assert a list response and return its rows.
export function items(response: ProbeResponse): Record<string, unknown>[] {
  expect(Array.isArray(response.body.data)).toBe(true)
  return response.body.data as Record<string, unknown>[]
}

// Assert 200 with at least one row — the shape of every positive read probe.
export function nonEmptyItems(response: ProbeResponse): Record<string, unknown>[] {
  expect(response.status).toBe(200)
  const rows = items(response)
  expect(rows.length).toBeGreaterThan(0)
  return rows
}

export function item(response: ProbeResponse): Record<string, unknown> {
  return response.body.data as Record<string, unknown>
}

export function errorCode(response: ProbeResponse): string | undefined {
  return response.body.errors?.[0]?.extensions?.code
}

export function forget<T>(list: T[], value: T): void {
  const index = list.indexOf(value)
  if (index !== -1) {
    list.splice(index, 1)
  }
}
