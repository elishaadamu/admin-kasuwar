import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const ACCESS_TOKEN = 'thisisjustarandomstring'

interface AuthUser {
  accountNo: string
  email: string
  role: string[]
  exp: number
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const getInitialToken = () => {
    const cookieState = getCookie(ACCESS_TOKEN)
    // Check for null, undefined, or the literal string "undefined"
    if (cookieState && cookieState !== 'undefined') {
      try {
        // Safely parse the cookie state
        return JSON.parse(cookieState) || ''
      } catch (e) {
        // Handle cases where the cookie contains malformed JSON
        return ''
      }
    }
    return ''
  }

  return {
    auth: {
      user: null,
      setUser: (user) =>
        set((state) => ({ ...state, auth: { ...state.auth, user } })),
      accessToken: getInitialToken(),
      setAccessToken: (accessToken) =>
        set((state) => {
          // Ensure we store a valid JSON string, defaulting to an empty string
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken || ''))
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          }
        }),
    },
  }
})
