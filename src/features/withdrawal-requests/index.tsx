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
import { UsersDialogs } from './components/users-dialogs'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'

const route = getRouteApi('/_authenticated/withdrawal-requests/')

export function WithdrawalRequests() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { user } = useAuth()
  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.WITHDRAWALS.GET_ALL) +
          (user?.id || user?._id)
      )
      console.log(response.data)

      const transactions = response.data?.withdrawals || []
      setUsers(transactions)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const processWithdrawal = async (
    withdrawalId: string,
    action: 'approve' | 'reject',
    notes?: string
  ) => {
    const adminId = user?.id || user?._id
    if (!adminId) return

    await toast.promise(
      axios.put(
        `${apiUrl(API_CONFIG.ENDPOINTS.WITHDRAWALS.PROCESS)}${adminId}/${withdrawalId}`,
        { action, notes }
      ),
      {
        loading: 'Processing withdrawal...',
        success: () => {
          fetchUsers() // Refetch on success
          return `Withdrawal has been ${action === 'approve' ? 'approved' : 'rejected'}.`
        },
        error: (err) => {
          console.error('Failed to process withdrawal:', err)
          return err.response?.data?.message || 'Failed to process withdrawal.'
        },
      }
    )
  }

  useEffect(() => {
    fetchUsers()
  }, [user])
  return (
    <UsersProvider
      processWithdrawal={processWithdrawal}
      updateUser={(id, changes) => console.log(id, changes)}
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
              Withdrawal Requests
            </h2>
            <p className='text-muted-foreground'>
              Manage withdrawal requests here.
            </p>
          </div>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <UsersTable
            data={users}
            search={search}
            navigate={navigate}
            isLoading={isLoading}
          />
        </div>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
