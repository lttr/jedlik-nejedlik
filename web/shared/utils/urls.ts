export function displayUrl(url: string): string {
  return url
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/?$/, "")
}
