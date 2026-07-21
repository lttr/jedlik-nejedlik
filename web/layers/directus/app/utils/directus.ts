let client: ReturnType<typeof createDirectusClient> | null = null

export function getDirectusClient(): ReturnType<typeof createDirectusClient> {
  client ??= createDirectusClient(useRuntimeConfig().public.directusUrl)
  return client
}

export function getImageUrl(cover: string): string {
  return `${useRuntimeConfig().public.directusUrl}/assets/${cover}`
}
