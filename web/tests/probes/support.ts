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
