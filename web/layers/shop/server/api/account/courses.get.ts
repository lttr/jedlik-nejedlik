import type { OwnedCourse } from "#layers/shop/shared/utils/owned-courses"
import { requireAccountDirectusClient } from "#layers/auth/server/utils/account-session"
import { readOwnedCourses } from "#layers/shop/server/utils/entitlements"

export default defineEventHandler(async (event): Promise<OwnedCourse[]> => {
  const { client } = await requireAccountDirectusClient(event)
  return readOwnedCourses(client)
})
