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
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SalesManagerTable } from './components/sm-table'
import { type User } from './data/schema'

const route = getRouteApi('/_authenticated/bdm/')

export function BDM() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState('bdm')

  // BDM state
  const [bdmUsers, setBdmUsers] = useState<User[]>([])
  const [isBdmLoading, setIsBdmLoading] = useState(true)

  // Sales Manager state
  const [smUsers, setSmUsers] = useState<User[]>([])
  const [isSmLoading, setIsSmLoading] = useState(false)





  const fetchBdmUsers = async () => {
    setIsBdmLoading(true)
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.MANAGERS.GET_ALL) + user?.id
      )
      setBdmUsers(response.data?.managers || [])
    } catch (error) {
      console.error('Failed to fetch managers', error)
    } finally {
      setIsBdmLoading(false)
    }
  }

  const fetchSmUsers = async () => {
    setIsSmLoading(true)
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.SALES_MANAGER.GET_ALL) + user?.id
      )
      console.log('SM data', response.data)
      setSmUsers(response.data?.managers || response.data || [])
    } catch (error) {
      console.error('Failed to fetch sales managers', error)
    } finally {
      setIsSmLoading(false)
    }
  }





  useEffect(() => {
    fetchBdmUsers()
  }, [])

  // Lazy-load data when tabs are selected
  useEffect(() => {
    if (activeTab === 'sm' && smUsers.length === 0 && !isSmLoading) {
      fetchSmUsers()
    }
  }, [activeTab])

  // Determine which users array & setter the Provider should use based on the active tab
  const getCurrentUsers = () => {
    switch (activeTab) {
      case 'sm': return smUsers
      default: return bdmUsers
    }
  }

  const setCurrentUsers = (fn: (prev: User[]) => User[]) => {
    switch (activeTab) {
      case 'sm': return setSmUsers(fn)
      default: return setBdmUsers(fn)
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
      updateUser={(id: string, changes: Partial<User>) =>
        setCurrentUsers((prev) =>
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
            <h2 className='text-2xl font-bold tracking-tight'>
              {activeTab === 'sm' ? 'Sales Managers' : 'BD/BDM Managers'}
            </h2>
            <p className='text-muted-foreground'>
              Coordinate managers and their roles here.
            </p>
          </div>
          <UsersPrimaryButtons activeTab={activeTab === 'bdm' ? 'bd/bdm' : activeTab} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-4'>
          <div className='block min-[992px]:hidden'>
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select view...' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='bdm'>BD/BDM</SelectItem>
                <SelectItem value='sm'>Sales Managers</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <TabsList className='hidden min-[992px]:flex'>
            <TabsTrigger value='bdm'>BD/BDM</TabsTrigger>
            <TabsTrigger value='sm'>Sales Managers</TabsTrigger>
          </TabsList>

          <TabsContent value='bdm' className='space-y-4'>
            <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
              <UsersTable
                data={bdmUsers}
                search={search}
                navigate={navigate}
                isLoading={isBdmLoading}
              />
            </div>
          </TabsContent>

          <TabsContent value='sm' className='space-y-4'>
            <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
              <SalesManagerTable
                data={smUsers}
                search={search}
                navigate={navigate}
                isLoading={isSmLoading}
              />
            </div>
          </TabsContent>




        </Tabs>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
