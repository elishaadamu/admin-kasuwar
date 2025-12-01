import { useEffect, useState } from 'react'
import axios from 'axios'
import { getRouteApi } from '@tanstack/react-router'
import { API_CONFIG, apiUrl } from '@/config/api'
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
import { type User } from './data/schema'

const route = getRouteApi('/_authenticated/delivery-management/')

export function DeliveryManagement() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { user } = useAuth()
  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.DELIVERY_MANAGEMENT.GET_ALL) + user?.id
      )
      console.log(response.data)

      const bdUsers = response.data?.deliveryMen || []
      setUsers(bdUsers)
    } catch (error) {
      console.error('Failed to fetch deivery men', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])
  return (
    <UsersProvider
      addUser={(newUser) => setUsers((prev) => [...prev, newUser])}
      removeUser={(id: string) =>
        setUsers((prev) =>
          prev.filter((u) => (u as any)._id !== id && (u as any).id !== id)
        )
      }
      updateUser={(id: string, changes: Partial<User>) =>
        setUsers((prev) =>
          prev.map((u) =>
            (u as any)._id === id || (u as any).id === id
              ? { ...u, ...changes }
              : u
          )
        )
      }
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
            <h2 className='text-2xl font-bold tracking-tight'>Delivery man</h2>
            <p className='text-muted-foreground'>
              Manager delivery men and their roles here.
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
