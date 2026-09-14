export default defineEventHandler(async (event) => {
  await logOutAccount(event)
  sendNoContent(event)
})
