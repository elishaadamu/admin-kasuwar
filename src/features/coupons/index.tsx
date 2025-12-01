// @ts-nocheck
import { useCallback, useEffect, useState } from 'react'
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
import { type Banner } from './components/users-columns'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'

const route = getRouteApi('/_authenticated/coupons/')

export function Coupons() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [coupons, setCoupons] = useState<Banner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  const fetchBanners = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.COUPON.GET_ALL + user?.id)
      )
      console.log(response.data)

      setCoupons(response.data.coupons || [])
    } catch (error) {
      console.error('Failed to fetch coupons', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBanners()
  }, [])

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <UsersProvider
        addUser={(newBanner) => setCoupons((prev) => [...prev, newBanner])}
        removeUser={(id: string) =>
          setCoupons((prev) => prev.filter((b) => b._id !== id))
        }
        updateUser={(id: string, changes: Partial<Banner>) =>
          setCoupons((prev) =>
            prev.map((b) => (b._id === id ? { ...b, ...changes } : b))
          )
        }
      >
        <Main>
          <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>Coupons</h2>
              <p className='text-muted-foreground'>
                Manage Coupons to create, edit, and delete
              </p>
            </div>
            <UsersPrimaryButtons />
          </div>

          <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
            <UsersTable
              data={coupons}
              search={search}
              navigate={navigate}
              isLoading={isLoading}
            />
          </div>
        </Main>

        <UsersDialogs />
      </UsersProvider>
    </>
  )
}
