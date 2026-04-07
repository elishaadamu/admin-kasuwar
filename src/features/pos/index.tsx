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
import { PosDialogs } from './components/pos-dialogs'
import { PosProvider } from './components/pos-provider'
import { PosTable } from './components/pos-table'
import { type PosOrder } from './data/schema'

const route = getRouteApi('/_authenticated/pos/')

export function Pos() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [orders, setOrders] = useState<PosOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.POS.GET_ALL_ORDERS),
        { withCredentials: true }
      )
      console.log(response.data)
      // The API returns { success: true, allOrders: [...] }
      const allOrders = response.data?.allOrders || []
      setOrders(allOrders)
    } catch (error) {
      console.error('Failed to fetch POS orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const addOrder = (newOrder: PosOrder) => {
    setOrders((prev) => [...prev, newOrder])
  }

  const removeOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o._id !== id))
  }

  const updateOrder = (id: string, changes: Partial<PosOrder>) =>
    setOrders((prev) =>
      prev.map((o) => (o._id === id ? { ...o, ...changes } : o))
    )

  return (
    <PosProvider
      addOrder={addOrder}
      removeOrder={removeOrder}
      updateOrder={updateOrder}
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
              POS Order Management
            </h2>
            <p className='text-muted-foreground'>
              Monitor POS transactions and verify payments.
            </p>
          </div>
        </div>

        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <PosTable
            data={orders}
            search={search}
            navigate={navigate}
            isLoading={isLoading}
          />
        </div>
      </Main>

      <PosDialogs />
    </PosProvider>
  )
}
