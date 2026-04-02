import { useEffect, useState } from 'react'
import axios from 'axios'
import { getRouteApi } from '@tanstack/react-router'
import { API_CONFIG, apiUrl } from '@/config/api'
import { toast } from 'sonner'
import { useAuth } from '@/context/auth-context'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UsersDialogs } from './components/users-dialogs'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'
import { type FundDebitUser, type UserTabType } from './types'

const route = getRouteApi('/_authenticated/fund-debit/')

export function FundDebit() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState<UserTabType>('bdm')

  // State for each user type
  const [bdmUsers, setBdmUsers] = useState<FundDebitUser[]>([])
  const [smUsers, setSmUsers] = useState<FundDebitUser[]>([])

  // Loading states
  const [loadingStates, setLoadingStates] = useState<Record<UserTabType, boolean>>({
    bdm: true,
    sm: true,
  })

  // Fetch all users and filter by role
  const fetchAllUsers = async () => {
    setLoadingStates((prev) => ({ ...prev, [activeTab]: true }))
    try {
      // Fetch from only BDM and SM endpoints
      const [bdmResponse, smResponse] = await Promise.all([
        axios.get(apiUrl(API_CONFIG.ENDPOINTS.MANAGERS.GET_ALL) + user?.id).catch(() => ({ data: { managers: [] } })),
        axios.get(apiUrl(API_CONFIG.ENDPOINTS.SALES_MANAGER.GET_ALL) + user?.id).catch(() => ({ data: {} })),
      ])

      // Helper to filter by specifically allowed roles
      const filterByRoles = (users: any, allowedRoles: string[]) => {
        const list = Array.isArray(users) ? users : []
        return list.filter(u => {
          const role = (u?.role || '').toLowerCase()
          // Always exclude TL and RM
          if (role === 'tl' || role === 'rm') return false
          // Only include if in the allowed list for this tab
          return allowedRoles.includes(role) || allowedRoles.includes(role.replace('-', ' '))
        })
      }

      // Get raw data from each response and inject default roles if missing
      const bdmRaw = (bdmResponse.data?.managers || (Array.isArray(bdmResponse.data) ? bdmResponse.data : []))
        .map((u: any) => ({ ...u, role: u.role || 'bdm' }))
      
      const smRaw = (smResponse.data?.managers || (Array.isArray(smResponse.data) ? smResponse.data : []))
        .map((u: any) => ({ ...u, role: u.role || 'sm' }))

      const filteredBdmData = filterByRoles(bdmRaw, ['bdm', 'bd'])
      const filteredSmData = filterByRoles(smRaw, ['sm', 'sales-manager', 'sales manager'])

      // Set each state with the raw data (no mapping, preserve original role)
      setBdmUsers(filteredBdmData)
      setSmUsers(filteredSmData)
    } catch (error) {
      console.error('Failed to fetch users', error)
    } finally {
      setLoadingStates((prev) => ({ ...prev, [activeTab]: false }))
    }
  }

  // Fund action handler
  const handleFund = async (userId: string, amount: number, description?: string) => {
    if (!user?.id) return
    
    try {
      await toast.promise(
        axios.post(
          `${apiUrl(API_CONFIG.ENDPOINTS.ADMIN.TRANSFER)}${user.id}`,
          { managerId: userId, amount, description: description || 'Funds transfer' }
        ),
        {
          success: `Funded ₦${amount.toLocaleString()} successfully`,
          loading: 'Processing fund...',
          error: (err) => err.response?.data?.message || 'Failed to fund user',
        }
      )
      // Refresh the current tab data
      refreshCurrentTab()
    } catch (error) {
      console.error('Fund failed', error)
      throw error
    }
  }

  // Debit action handler
  const handleDebit = async (userId: string, amount: number, description?: string) => {
    if (!user?.id) return
    
    try {
      await toast.promise(
        axios.put(
          `${apiUrl(API_CONFIG.ENDPOINTS.ADMIN.DEBIT)}${user.id}`,
          { managerId: userId, amount, description: description || 'Funds debit' }
        ),
        {
          success: `Debited ₦${amount.toLocaleString()} successfully`,
          loading: 'Processing debit...',
          error: (err) => err.response?.data?.message || 'Failed to debit user',
        }
      )
      // Refresh the current tab data
      refreshCurrentTab()
    } catch (error) {
      console.error('Debit failed', error)
      throw error
    }
  }

  const refreshCurrentTab = () => {
    fetchAllUsers()
  }

  // Load initial data
  useEffect(() => {
    fetchAllUsers()
  }, [])

  // Fetch data when tabs are selected
  useEffect(() => {
    fetchAllUsers()
  }, [activeTab])

  const setCurrentUsers = (fn: (prev: FundDebitUser[]) => FundDebitUser[]) => {
    switch (activeTab) {
      case 'sm': setSmUsers(fn); break
      default: setBdmUsers(fn)
    }
  }

  return (
    <UsersProvider
      addUser={(newUser) => setCurrentUsers((prev) => [...prev, newUser])}
      removeUser={(id: string) =>
        setCurrentUsers((prev) =>
          prev.filter((u) => (u as any)._id !== id && (u as any).id !== id)
        )
      }
      updateUser={(id: string, changes: Partial<FundDebitUser>) =>
        setCurrentUsers((prev) =>
          prev.map((u) =>
            (u as any)._id === id || (u as any).id === id
              ? { ...u, ...changes }
              : u
          )
        )
      }
      onFund={handleFund}
      onDebit={handleDebit}
    >
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Fund & Debit Management
            </h2>
            <p className='text-muted-foreground'>
              Manage user wallets across all roles. Fund or debit user accounts.
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as UserTabType)} className='space-y-4'>
          <div className='block min-[992px]:hidden'>
            <Select value={activeTab} onValueChange={(value) => setActiveTab(value as UserTabType)}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select view...' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='bdm'>BD/BDM</SelectItem>
                <SelectItem value='sm'>Sales Managers</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <TabsList className='hidden min-[992px]:flex flex-wrap'>
            <TabsTrigger value='bdm'>BD/BDM</TabsTrigger>
            <TabsTrigger value='sm'>Sales Managers</TabsTrigger>
          </TabsList>

          <TabsContent value='bdm' className='space-y-4'>
            <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
              <UsersTable
                data={bdmUsers}
                search={search}
                navigate={navigate}
                isLoading={loadingStates.bdm}
                loadingText='Loading BDM...'
              />
            </div>
          </TabsContent>

          <TabsContent value='sm' className='space-y-4'>
            <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
              <UsersTable
                data={smUsers}
                search={search}
                navigate={navigate}
                isLoading={loadingStates.sm}
                loadingText='Loading Sales Managers...'
              />
            </div>
          </TabsContent>


        </Tabs>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
