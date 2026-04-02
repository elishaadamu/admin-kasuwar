import { useEffect, useState } from 'react'
import axios from 'axios'
import { getRouteApi } from '@tanstack/react-router'
import { API_CONFIG, apiUrl } from '@/config/api'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { UsersDialogs } from '../bdm/components/users-dialogs'
import { UsersPrimaryButtons } from '../bdm/components/users-primary-buttons'
import { UsersProvider } from '../bdm/components/users-provider'
import { UsersTable } from '../bdm/components/users-table'
import { type User } from '../bdm/data/schema'

const route = getRouteApi('/_authenticated/hr/')

export function HRManagement() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const [hrUsers, setHrUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchHrUsers = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.HR.GET_ALL)
      )
      console.log('HR data', response.data)
      const data = response.data?.hrs || response.data?.hr || []
      const mappedData = data.map((item: any) => ({
        ...item,
        name: item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'N/A',
        id: item._id || item.id,
        role: item.role || 'hr',
      }))
      setHrUsers(mappedData)
    } catch (error) {
      console.error('Failed to fetch HR users', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHrUsers()
  }, [])

  return (
    <UsersProvider
      activeTab='hr'
      setActiveTab={() => {}}
      addUser={(newUser) => setHrUsers((prev) => [...prev, newUser])}
      removeUser={(id: string) =>
        setHrUsers((prev) =>
          prev.filter((u) => (u as any)._id !== id && (u as any).id !== id)
        )
      }
      updateUser={(id: string, changes: Partial<User>) =>
        setHrUsers((prev) =>
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
            <h2 className='text-2xl font-bold tracking-tight'>HR Management</h2>
            <p className='text-muted-foreground'>
              Manage your HR team and their access here.
            </p>
          </div>
          <UsersPrimaryButtons activeTab='hr' />
        </div>

        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <UsersTable
            data={hrUsers}
            search={search}
            navigate={navigate}
            isLoading={isLoading}
            loadingText='Loading HR...'
          />
        </div>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
