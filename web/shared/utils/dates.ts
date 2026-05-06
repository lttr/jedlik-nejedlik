export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("cs-CZ", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}
