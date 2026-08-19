export default defineEventHandler(async (event) => {
  const credentials = await readCredentials(event)
  const session = await loginToDirectus(event, credentials)
  setDirectusSession(event, session)
  return { student: await readStudent(event) }
})
