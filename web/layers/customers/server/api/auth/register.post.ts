export default defineEventHandler(async (event) => {
  // Validation first: a malformed payload never reaches Directus, so it
  // costs nothing and must not spend a Student's typo budget.
  const credentials = await readRegistration(event)
  enforceRateLimit(event, REGISTRATION_RATE_LIMIT)

  await createStudent(event, credentials)

  // Registration ends logged in — nothing stands between the new Student and
  // the purchase they came for.
  setDirectusSession(event, await loginToDirectus(event, credentials))
  return { student: await readStudent(event) }
})
