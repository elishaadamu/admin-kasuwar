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
import { UsersDialogs } from '../bdm/components/users-dialogs'
import { UsersPrimaryButtons } from '../bdm/components/users-primary-buttons'
import { UsersProvider } from '../bdm/components/users-provider'
import { SalesManagerTable } from '../bdm/components/sm-table'
import { type User } from '../bdm/data/schema'

const route = getRouteApi('/_authenticated/sm/')

export function SalesManagers() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { user } = useAuth()

  const [smUsers, setSmUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchSmUsers = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.SALES_MANAGER.GET_ALL) + user?.id
      )
      console.log('SM data', response.data)
      setSmUsers(response.data?.managers || response.data || [])
    } catch (error) {
      console.error('Failed to fetch sales managers', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSmUsers()
  }, [])

  return (
    <UsersProvider
      activeTab='sm'
      setActiveTab={() => {}}
      addUser={(newUser) => setSmUsers((prev) => [...prev, newUser])}
      removeUser={(id: string) =>
        setSmUsers((prev) =>
          prev.filter((u) => (u as any)._id !== id && (u as any).id !== id)
        )
      }
      updateUser={(id: string, changes: Partial<User>) =>
        setSmUsers((prev) =>
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
            <h2 className='text-2xl font-bold tracking-tight'>Sales Managers</h2>
            <p className='text-muted-foreground'>
              Coordinate sales managers and their roles here.
            </p>
          </div>
          <UsersPrimaryButtons activeTab='sm' />
        </div>

        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <SalesManagerTable
            data={smUsers}
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
