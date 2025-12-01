// @ts-nocheck
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

const route = getRouteApi('/_authenticated/vendors/')

export function Vendors() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { user } = useAuth()
  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.VENDORS.GET_ALL) + user?.id
      )
      console.log(response.data)

      const Vendors = response.data?.vendors || []
      setUsers(Vendors)
    } catch (error) {
      console.error('Failed to fetch Vendors:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const addUser = (newUser: User) => {
    setUsers((prev) => [newUser, ...prev])
  }

  const removeUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u._id !== id))
  }

  const updateUser = (id: string, changes: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, ...changes } : u))
    )
  }

  return (
    <UsersProvider
      addUser={addUser}
      removeUser={removeUser}
      updateUser={updateUser}
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
            <h2 className='text-2xl font-bold tracking-tight'>Vendor List</h2>
            <p className='text-muted-foreground'>
              Manage Vendors and their roles here.
            </p>
          </div>
          {/* <div>
            <UsersPrimaryButtons />
          </div> */}
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
