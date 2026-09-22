import type { OwnedCourse } from "../../../shared/utils/owned-courses"

// „Moje kurzy" on the Account page: the Courses this Student owns. The read
// runs on the caller's own session (ADR 0004), so the list can only ever be
// their own — there is no Student id anywhere in this route to get wrong.
export default defineEventHandler(async (event): Promise<OwnedCourse[]> => {
  const { client } = await requireAccountDirectusClient(event)
  return readOwnedCourses(client)
})
