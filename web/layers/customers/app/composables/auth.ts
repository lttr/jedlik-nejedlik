import type { ComputedRef, Ref } from "vue"

import type {
  Credentials,
  PasswordResetInput,
  RegisterInput,
  SessionUser,
} from "../../shared/utils/auth"

interface UseAuth {
  user: Ref<SessionUser | null>
  isLoggedIn: ComputedRef<boolean>
  login: (credentials: Credentials) => Promise<void>
  logout: () => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  resetPassword: (input: PasswordResetInput) => Promise<void>
}

// Shared reactive identity. Populated once during SSR by the auth plugin and
// serialised to the client via the Nuxt payload.
export function useAuthUser(): Ref<SessionUser | null> {
  return useState<SessionUser | null>("auth.user", () => null)
}

// Stateless actions live at module scope — they only talk to our API routes.
async function register(input: RegisterInput): Promise<void> {
  await $fetch("/api/auth/register", { method: "POST", body: input })
}

async function requestPasswordReset(email: string): Promise<void> {
  await $fetch("/api/auth/password-request", { method: "POST", body: { email } })
}

async function resetPassword(input: PasswordResetInput): Promise<void> {
  await $fetch("/api/auth/password-reset", { method: "POST", body: input })
}

export function useAuth(): UseAuth {
  const user = useAuthUser()
  const isLoggedIn = computed(() => user.value !== null)

  async function login(credentials: Credentials): Promise<void> {
    const { user: loggedIn } = await $fetch("/api/auth/login", {
      method: "POST",
      body: credentials,
    })
    user.value = loggedIn
  }

  async function logout(): Promise<void> {
    await $fetch("/api/auth/logout", { method: "POST" })
    user.value = null
    await navigateTo("/prihlaseni")
  }

  return { user, isLoggedIn, login, logout, register, requestPasswordReset, resetPassword }
}
