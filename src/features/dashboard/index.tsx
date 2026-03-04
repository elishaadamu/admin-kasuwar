// @ts-nocheck
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from '@tanstack/react-router'
import { API_CONFIG, apiUrl } from '@/config/api'
import { useAuth } from '@/context/auth-context'
// Import useAuth
// Import useAuth
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { RecentSales } from './components/recent-sales'

export function Dashboard() {
  const { user, appState, isStateLoading } = useAuth() // Get user and appState from AuthContext
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [agents, setAgents] = useState([])
  const [vendors, setVendors] = useState([])
  const [managers, setManagers] = useState([])

  const ENDPOINTS = {
    customers: user?.id
      ? apiUrl(API_CONFIG.ENDPOINTS.CUSTOMERS.GET_ALL) + user.id
      : '',
    agents: user?.id
      ? apiUrl(API_CONFIG.ENDPOINTS.AGENT.GET_ALL) + user.id
      : '',
    vendors: user?.id
      ? apiUrl(API_CONFIG.ENDPOINTS.VENDORS.GET_ALL) + user.id
      : '',
    managers: user?.id
      ? apiUrl(API_CONFIG.ENDPOINTS.MANAGERS.GET_ALL) + user.id
      : '',
  }

  const fetchUsers = async () => {
    if (!user?.id) return
    setIsLoading(true)
    try {
      const responseCustomers = await axios.get(ENDPOINTS.customers)

      setUsers(responseCustomers.data?.users || [])
      const responseVendors = await axios.get(ENDPOINTS.vendors)
      setVendors(responseVendors.data?.vendors || [])
      const responseAgents = await axios.get(ENDPOINTS.agents)
      setAgents(responseAgents.data || [])
      console.log(responseAgents.data)
      const responseManagers = await axios.get(ENDPOINTS.managers)
      setManagers(responseManagers.data?.managers || [])
    } catch (error) {
      console.error('Failed to fetch Vendors:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [user])

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
        </div>
        <Tabs
          orientation='vertical'
          defaultValue='overview'
          className='space-y-4'
        >
          <TabsContent value='overview' className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Users
                  </CardTitle>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    className='text-muted-foreground h-4 w-4'
                  >
                    <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
                    <circle cx='9' cy='7' r='4' />
                    <path d='M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {isStateLoading ? '...' : (appState?.totals.user ?? 0)}
                  </div>
                  <p className='text-muted-foreground text-xs'>
                    Total registered users
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Vendors
                  </CardTitle>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    className='text-muted-foreground h-4 w-4'
                  >
                    <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
                    <circle cx='9' cy='7' r='4' />
                    <path d='M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {isStateLoading ? '...' : (appState?.totals.vendor ?? 0)}
                  </div>
                  <p className='text-muted-foreground text-xs'>
                    Total registered vendors
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Agents
                  </CardTitle>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    className='text-muted-foreground h-4 w-4'
                  >
                    <rect width='20' height='14' x='2' y='5' rx='2' />
                    <path d='M2 10h20' />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {isStateLoading ? '...' : (appState?.totals.agent ?? 0)}
                  </div>
                  <p className='text-muted-foreground text-xs'>
                    Total registered agents
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Admins
                  </CardTitle>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    className='text-muted-foreground h-4 w-4'
                  >
                    <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
                    <circle cx='9' cy='7' r='4' />
                    <path d='M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {isStateLoading ? '...' : (appState?.totals.admin ?? 0)}
                  </div>
                  <p className='text-muted-foreground text-xs'>
                    Total registered admins
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between'>
                  <CardTitle>Recent Users</CardTitle>
                  <Link
                    to='/customers'
                    className='text-[16px] font-medium text-gray-500 hover:underline'
                  >
                    See more
                  </Link>
                </CardHeader>
                <CardContent>
                  <RecentSales data={users.slice(0, 5)} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between'>
                  <CardTitle>Recent Agents</CardTitle>
                  <Link
                    to='/agents'
                    className='text-[16px] font-medium text-gray-500 hover:underline'
                  >
                    See more
                  </Link>
                </CardHeader>
                <CardContent>
                  <RecentSales data={agents.slice(0, 5)} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between'>
                  <CardTitle>Recent Vendors</CardTitle>
                  <Link
                    to='/vendors'
                    className='text-[16px] font-medium text-gray-500 hover:underline'
                  >
                    See more
                  </Link>
                </CardHeader>
                <CardContent>
                  <RecentSales data={vendors?.slice(0, 5)} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between'>
                  <CardTitle>Business Development Managers</CardTitle>
                  <Link
                    to='/bdm'
                    className='text-[16px] font-medium text-gray-500 hover:underline'
                  >
                    See more
                  </Link>
                </CardHeader>
                <CardContent>
                  <RecentSales
                    data={managers
                      ?.filter((item) => item.role === 'bdm')
                      .slice(0, 5)}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between'>
                  <CardTitle>Business Developers</CardTitle>
                  <Link
                    to='/bdm'
                    className='text-[16px] font-medium text-gray-500 hover:underline'
                  >
                    See more
                  </Link>
                </CardHeader>
                <CardContent>
                  <RecentSales
                    data={managers
                      ?.filter((item) => item.role === 'bd')
                      .slice(0, 5)}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
