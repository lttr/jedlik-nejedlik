// The Nitro middleware already resolved the Student for this request; copy it
// into app state before the first render.
export default defineNuxtPlugin(() => {
  useStudentState().value = useRequestEvent()?.context.student ?? null
})
