export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("cs-CZ", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}
