// Shared plumbing for the on-demand Directus permission probes. The probes
// hit the production instance and assert externally observable access
// behaviour per role — what each token can read or write — never Directus
// internals. Run via `vp run directus:probe`; they are intentionally not
// part of the default test run.

export const DIRECTUS_URL = "https://obsah-jedlika.lttr.cz"

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
