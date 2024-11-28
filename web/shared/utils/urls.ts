export function displayUrl(url: string) {
  return url
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/?$/, "")
}
