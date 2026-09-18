// The browser's half of the pending-checkout cookie. It is `httpOnly`, so the
// only way to ask what is in it is to consume it through the route — which is
// exactly what both callers (the login page and the verification landing) want
// to do anyway.
export async function takePendingCheckoutSlug(): Promise<string | null> {
  const { slug } = await $fetch<{ slug: string | null }>("/api/pending-checkout", {
    method: "POST",
  })
  return slug
}
