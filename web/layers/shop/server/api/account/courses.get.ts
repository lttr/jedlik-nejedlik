import type { OwnedCourse } from "../../../shared/utils/owned-courses"

export default defineEventHandler(async (event): Promise<OwnedCourse[]> => {
  const { client } = await requireAccountDirectusClient(event)
  return readOwnedCourses(client)
})
