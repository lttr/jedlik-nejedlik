// The browser's half of the pending-checkout cookie. It is `httpOnly`, so the
// only way to ask what is in it is to consume it through the route — which is
// exactly what both callers (the login page and the verification landing) want
// to do anyway.
//
// Never fatal. Both callers ask for it *after* the irreversible step has
// already succeeded — a verification token is spent, a session is live — and
// they ask inside the form's `submit`, where a rejection would be shown as
// „something went wrong" and swallow the navigation with it. A cookie we
// could not read costs the detour back to the Checkout, nothing more; it
// expires on its own a day later.
export async function takePendingCheckoutSlug(): Promise<string | null> {
  const answer = await $fetch<{ slug: string | null }>("/api/pending-checkout", {
    method: "POST",
  }).catch((error: unknown) => {
    console.warn("[shop] Could not read the pending checkout", error)
    return { slug: null }
  })
  return answer.slug
}
