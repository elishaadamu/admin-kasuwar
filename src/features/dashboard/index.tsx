// @ts-nocheck
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from '@tanstack/react-router'
import { API_CONFIG, apiUrl } from '@/config/api'
import { useAuth } from '@/context/auth-context'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { DashboardStats } from './components/dashboard-stats'
import { RecentSales } from './components/recent-sales'

import {
  Users,
  Store,
  Briefcase,
  Network,
  ShieldCheck,
  Building,
  ArrowRight,
} from 'lucide-react'

export function Dashboard() {
  const { user, appState, isStateLoading } = useAuth()
  const [users, setUsers] = useState([])
  const [agents, setAgents] = useState([])
  const [vendors, setVendors] = useState([])
  const [managers, setManagers] = useState([])
  const [salesManagers, setSalesManagers] = useState([])
  const [hrs, setHrs] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const ENDPOINTS = {
    customers: user?.id ? apiUrl(API_CONFIG.ENDPOINTS.CUSTOMERS.GET_ALL) + user.id : '',
    agents: user?.id ? apiUrl(API_CONFIG.ENDPOINTS.AGENT.GET_ALL) + user.id : '',
    vendors: user?.id ? apiUrl(API_CONFIG.ENDPOINTS.VENDORS.GET_ALL) + user.id : '',
    managers: user?.id ? apiUrl(API_CONFIG.ENDPOINTS.MANAGERS.GET_ALL) + user.id : '',
    salesManagers: user?.id ? apiUrl(API_CONFIG.ENDPOINTS.SALES_MANAGER.GET_ALL) + user.id : '',
    hrs: apiUrl(API_CONFIG.ENDPOINTS.HR.GET_ALL),
  }

  const fetchUsers = async () => {
    if (!user?.id) return
    setIsLoading(true)
    try {
      const [
        customersRes,
        vendorsRes,
        agentsRes,
        managersRes,
        salesManagersRes,
        hrsRes
      ] = await Promise.allSettled([
        axios.get(ENDPOINTS.customers),
        axios.get(ENDPOINTS.vendors),
        axios.get(ENDPOINTS.agents),
        axios.get(ENDPOINTS.managers),
        axios.get(ENDPOINTS.salesManagers),
        axios.get(ENDPOINTS.hrs),
      ])
      
      if (customersRes.status === 'fulfilled') setUsers(customersRes.value.data?.users || [])
      if (vendorsRes.status === 'fulfilled') setVendors(vendorsRes.value.data?.vendors || [])
      if (agentsRes.status === 'fulfilled') setAgents(agentsRes.value.data || [])
      if (managersRes.status === 'fulfilled') setManagers(managersRes.value.data?.managers || [])
      if (salesManagersRes.status === 'fulfilled') {
        const sData = salesManagersRes.value.data
        const smArray = sData?.salesManagers || sData?.managers || sData
        setSalesManagers(Array.isArray(smArray) ? smArray : [])
      }
      
      if (hrsRes.status === 'fulfilled') {
        const hData = hrsRes.value.data
        const hrArray = hData?.hrs || hData?.hr || hData?.hrRecords || hData
        setHrs(Array.isArray(hrArray) ? hrArray : [])
      }
    } catch (error) {
      console.error('Failed to fetch:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [user])

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
            <p className='text-muted-foreground text-sm'>
              Welcome back{user?.firstName ? `, ${user.firstName}` : ''}! Here's your platform overview.
            </p>
          </div>
        </div>

        {/* ═══ Dashboard Stats ═══ */}
        <DashboardStats />

        {/* ═══ Recent Activity Cards ═══ */}
        <div className='mt-12 mb-6'>
          <h2 className='text-xl font-bold tracking-tight mb-1'>Recent Registrations & Activity</h2>
          <p className='text-muted-foreground text-sm'>A quick view of the newest members grouped by roles.</p>
        </div>
        
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3 pb-8'>
          
          <RecentActivityCard 
            title="Recent Customers" 
            link="/customers" 
            data={users.slice(0, 5)} 
            icon={<Users className="h-5 w-5 text-blue-500" />} 
          />

          <RecentActivityCard 
            title="Recent Agents" 
            link="/agents" 
            data={agents.slice(0, 5)} 
            icon={<Network className="h-5 w-5 text-indigo-500" />} 
          />

          <RecentActivityCard 
            title="Recent Vendors" 
            link="/vendors" 
            data={vendors?.slice(0, 5)} 
            icon={<Store className="h-5 w-5 text-orange-500" />} 
          />

          <RecentActivityCard 
            title="Business Dev. Managers" 
            link="/bdm" 
            data={managers?.filter((item) => item.role === 'bdm').slice(0, 5)} 
            icon={<Building className="h-5 w-5 text-purple-500" />} 
          />

          <RecentActivityCard 
            title="Business Developers" 
            link="/bdm" 
            data={managers?.filter((item) => item.role === 'bd').slice(0, 5)} 
            icon={<Briefcase className="h-5 w-5 text-teal-500" />} 
          />

          <RecentActivityCard 
            title="Sales Managers" 
            link="/bdm" // Update if there's a specific route for sales managers
            data={salesManagers?.slice(0, 5)} 
            icon={<ShieldCheck className="h-5 w-5 text-emerald-500" />} 
          />

          <RecentActivityCard 
            title="Human Resources (HR)" 
            link="/bdm" // Update if there's a specific route for HR
            data={hrs?.slice(0, 5)} 
            icon={<Users className="h-5 w-5 text-rose-500" />} 
          />

        </div>
      </Main>
    </>
  )
}

function RecentActivityCard({ title, link, data, icon }) {
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </div>
        <Link
          to={link}
          className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center"
        >
          View all <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="pt-4 pb-5 flex-1">
        <RecentSales data={data || []} />
      </CardContent>
    </Card>
  )
}

