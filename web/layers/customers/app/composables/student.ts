// App-wide identity. The state is filled during SSR (see plugins/student.server.ts)
// and travels in the payload, so the client renders the same thing the server
// did. Auth actions keep it current after login and logout.
export function useStudentState(): Ref<Student | null> {
  return useState<Student | null>("student", () => null)
}

export interface StudentSession {
  student: Ref<Student | null>
  loggedIn: ComputedRef<boolean>
}

export function useStudent(): StudentSession {
  const student = useStudentState()
  return {
    student,
    loggedIn: computed(() => student.value !== null),
  }
}
