// The browser's half of the pending-checkout cookie: it is `httpOnly`, so
// reading it means consuming it through the route. Never fatal — both callers
// ask after the irreversible step has already succeeded.
// See docs/shop.md, „Pending checkout".
export async function takePendingCheckoutSlug(): Promise<string | null> {
  const answer = await $fetch<{ slug: string | null }>("/api/pending-checkout", {
    method: "POST",
  }).catch((error: unknown) => {
    console.warn("[shop] Could not read the pending checkout", error)
    return { slug: null }
  })
  return answer.slug
}
