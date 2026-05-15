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
import { type User as DeliveryMan } from '../delivery-management/data/schema'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
// Import DeliveryRequest type
import { UsersTable } from './components/users-table'
import { type DeliveryRequest } from './types'

const route = getRouteApi('/_authenticated/delivery-requests/')

export function DeliveryRequest() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [users, setUsers] = useState<DeliveryRequest[]>([]) // Changed User to DeliveryRequest
  const [deliveryMen, setDeliveryMen] = useState<DeliveryMan[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { user } = useAuth()
  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.DELIVERY_REQUESTS.GET_ALL)
      )

      const bdUsers = response.data.requests || []
      setUsers(bdUsers)
    } catch (error) {
      console.error('Failed to fetch deivery men', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDeliveryMen = async () => {
    try {
      if (!user?.id) return
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.DELIVERY_MANAGEMENT.GET_ALL) + user?.id
      )
      const men = response.data?.deliveryMen || []
      setDeliveryMen(men)
    } catch (err) {
      console.error('Failed to fetch delivery men', err)
    }
  }

  const assignDeliveryTask = async (
    requestId: string,
    deliveryManId: string,
    price: number
  ) => {
    if (!user?.id) return
    // optimistic update (cast to any to avoid TS excess property errors)
    setUsers((prev) =>
      prev.map((u) =>
        (u as any)._id === requestId
          ? ({ ...u, deliveryManId, assignedPrice: price } as any)
          : u
      )
    )

    try {
      await toast.promise(
        axios.put(
          `${apiUrl(API_CONFIG.ENDPOINTS.DELIVERY_REQUESTS.ASSIGN)}${user.id}/${requestId}`,
          { deliveryManId, price }
        ),
        {
          success: 'Delivery task assigned successfully.',
        }
      )
    } catch (err) {
      console.error('Assign failed', err)
      // revert optimistic state (simple strategy: refetch all)
      fetchUsers()
    }
  }

  const setDeliveryPrice = async (requestId: string, price: number) => {
    if (!user?.id) return
    // optimistic update
    setUsers((prev) =>
      prev.map((u) =>
        (u as any)._id === requestId ? ({ ...u, price } as any) : u
      )
    )

    try {
      await toast.promise(
        axios.put(
          `${apiUrl(API_CONFIG.ENDPOINTS.DELIVERY_REQUESTS.ASSIGN_PRICE)}${user.id}/${requestId}`,
          { price }
        ),
        {
          success: 'Delivery price set successfully.',
        }
      )
    } catch (err) {
      console.error('Set price failed', err)
      // revert optimistic state
      fetchUsers()
      throw err // re-throw to be caught in the dialog
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchDeliveryMen()
  }, [])
  return (
    <UsersProvider
      addUser={(newUser) => setUsers((prev) => [...prev, newUser])} // newUser is DeliveryRequest
      removeUser={(id: string) =>
        setUsers((prev) => prev.filter((u) => u._id !== id))
      }
      updateUser={(
        id: string,
        changes: Partial<DeliveryRequest> // Changed User to DeliveryRequest
      ) =>
        setUsers((prev) =>
          prev.map((u) =>
            (u as any)._id === id ? ({ ...u, ...changes } as any) : u
          )
        )
      }
      deliveryMen={deliveryMen}
      assignDeliveryTask={assignDeliveryTask}
      setDeliveryPrice={setDeliveryPrice}
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
              Delivery Request
            </h2>
            <p className='text-muted-foreground'>
              Manage delivery requests and send reports.
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
