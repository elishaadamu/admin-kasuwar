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
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'
import { type User } from './data/schema'

const route = getRouteApi('/_authenticated/category/')

export function Category() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.CATEGORY.GET)
      )
      console.log('Categories', response.data)

      const bdUsers = response.data?.categories || []
      setUsers(bdUsers)
    } catch (error) {
      console.error('Failed to fetch business developers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const addUser = (newUser: User) => {
    setUsers((prev) => [...prev, newUser])
  }

  const removeUser = (id: string) => {
    setUsers((prev) =>
      prev.filter((u) => (u as any)._id !== id && (u as any).id !== id)
    )
  }

  const updateUser = (id: string, changes: Partial<User>) =>
    setUsers((prev) =>
      prev.map((u) =>
        (u as any)._id === id || (u as any).id === id ? { ...u, ...changes } : u
      )
    )

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
            <h2 className='text-2xl font-bold tracking-tight'>Category List</h2>
            <p className='text-muted-foreground'>
              Manage Categories and their details here.
            </p>
          </div>
          <UsersPrimaryButtons />
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
