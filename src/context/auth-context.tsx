// @ts-nocheck
import {
  type ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import axios from 'axios'
import { API_CONFIG, apiUrl } from '@/config/api'
import { toast } from 'sonner'
import logo from '@/assets/logo.png'
import { encryptData, decryptData } from '@/lib/secure-storage'
import { useIdleTimeout } from '@/hooks/use-idle-timeout'
import { LocationProvider } from './location-context'

interface User {
  id: string
  _id: string
  firstName?: string
  lastName?: string
  middleName?: string
  email?: string
  phone?: string
  passportPhoto?: string
  gender?: string
  maritalStatus?: string
  dateOfBirth?: string
  address?: string
  state?: string
  localGovt?: string
  accountName?: string
  accountNumber?: string
  // Keeping these as they seem important for session management
  role?: string[]
  exp?: number
  status?: string
}

interface Totals {
  agent: number
  vendor: number
  user: number
  admin: number
}

interface PeriodStats {
  counts: Record<string, number>
  users: Record<string, any[]>
}

interface AppState {
  periodRanges: Record<string, string>
  totals: Totals
  today: PeriodStats
  thisWeek: PeriodStats
  thisMonth: PeriodStats
  bdStats: Record<string, { count: number; users: any[] }>
  recentSales?: any[] // Assuming recent sales might be part of this
}
interface Endpoints {
  customers: string
  agents: string
  vendors: string
  managers: string
}

export interface AuthContextType {
  user: User | null
  login: (user: User) => void
  logout: () => void
  isAuthenticated: boolean
  ENDPOINTS: Endpoints
  appState: AppState | null
  isStateLoading: boolean
  refetchState: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [appState, setAppState] = useState<AppState | null>(null)
  const [isStateLoading, setIsStateLoading] = useState(true)

  // Use the idle timeout hook to manage session timeouts
  useIdleTimeout()

  const logout = useCallback(() => {
    localStorage.clear() // Clear all localStorage for this domain
    setUser(null)
  }, [])

  const login = useCallback((newUser: User) => {
    const encryptedUser = encryptData(newUser)
    localStorage.setItem('user', encryptedUser)
    setUser(newUser)
  }, [])

  const fetchState = useCallback(async () => {
    if (!user?.id) return
    setIsStateLoading(true)
    try {
      const response = await axios.get(
        `${apiUrl(API_CONFIG.ENDPOINTS.ADMIN.CURRENT_STATS)}${user.id}`
      )
     
      setAppState(response.data)
    } catch (error) {
      console.error('Failed to fetch app state:', error)
      toast.error('Failed to load application statistics.')
    } finally {
      setIsStateLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    const storedUser = localStorage.getItem('user')

    // Global listener for logout events (e.g., from Axios interceptors)
    const handleLogoutEvent = () => {
      logout()
      // Optionally, redirect to sign-in page from here
      window.location.href = '/sign-in'
    }

    if (storedUser) {
      const decryptedUser = decryptData<User>(storedUser)
      window.addEventListener('logout', handleLogoutEvent)

      if (
        decryptedUser &&
        (!decryptedUser.exp || decryptedUser.exp * 1000 > Date.now())
      ) {
        setUser(decryptedUser)
      } else {
        // Token expired or decryption failed
        logout()
      }
    }

    return () => {
      window.removeEventListener('logout', handleLogoutEvent)
    }
  }, [logout])

  useEffect(() => {
    if (user) {
      fetchState()
    }
  }, [user, fetchState])

  const isAuthenticated = !!user

  return (
    <LocationProvider>
      <AuthContext.Provider
        value={{
          user,
          login,
          logout,
          isAuthenticated,

          appState,
          isStateLoading,
          refetchState: fetchState,
        }}
      >
        {children}
      </AuthContext.Provider>
    </LocationProvider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const websiteData = () => {
  return {
    logo: logo,
    websitename: 'Kasuwar Zamani',
  }
}
