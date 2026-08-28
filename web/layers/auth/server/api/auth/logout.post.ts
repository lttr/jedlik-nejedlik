export default defineEventHandler(async (event) => {
  await logOutStudent(event)
  sendNoContent(event)
})
