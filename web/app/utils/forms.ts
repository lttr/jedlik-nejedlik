export function objectFromFormData(formData: FormData) {
  return Object.fromEntries(
    // Using Array.from() for Safari iOS compatibility (Iterator.prototype.map is ES2025)
    Array.from(formData.entries()).map(([key, value]) => [key, String(value)]),
  )
}
