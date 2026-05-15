// @ts-nocheck
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from '@tanstack/react-router'
import { API_CONFIG, apiUrl } from '@/config/api'
import { useAuth } from '@/context/auth-context'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Badge } from '@/components/ui/badge'
import {
  Users,
  UserCheck,
  UserX,
  ShoppingCart,
  Package,
  Store,
  Truck,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  Globe,
  MapPin,
  Loader2,
  Eye,
  CircleDollarSign,
  ShieldCheck,
  PackageCheck,
  Receipt,
  Percent,
  Crown,
  ClipboardList,
} from 'lucide-react'


// ─── Period Filter Toggle ───
type Period = 'today' | 'thisWeek' | 'thisMonth'

interface DashboardStatsProps { }

export function DashboardStats({ }: DashboardStatsProps) {
  const { user, appState, isStateLoading, refetchState } = useAuth()
  const [period, setPeriod] = useState<Period>('today')
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [deliveryMen, setDeliveryMen] = useState<any[]>([])
  const [deliveryRequests, setDeliveryRequests] = useState<any[]>([])
  const [vendors, setVendors] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [regionsOverview, setRegionsOverview] = useState<any>(null)
  const [regionDetails, setRegionDetails] = useState<any[]>([])
  const [transactionStats, setTransactionStats] = useState<any>(null)
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [isLoadingExtra, setIsLoadingExtra] = useState(false)

  // Fetch supplementary data
  useEffect(() => {
    if (!user?.id) return

    const fetchAll = async () => {
      setIsLoadingExtra(true)
      try {
        const [
          ordersRes,
          productsRes,
          deliveryMenRes,
          deliveryReqRes,
          vendorsRes,
          customersRes,
          regionsRes,
          txStatsRes,
          withdrawalsRes,
        ] = await Promise.allSettled([
          axios.get(apiUrl(API_CONFIG.ENDPOINTS.ORDER.GET) + user.id),
          axios.get(apiUrl(API_CONFIG.ENDPOINTS.PRODUCT.GET) + user.id),
          axios.get(apiUrl(API_CONFIG.ENDPOINTS.DELIVERY_MANAGEMENT.GET_ALL) + user.id),
          axios.get(apiUrl(API_CONFIG.ENDPOINTS.DELIVERY_REQUESTS.GET_ALL)),
          axios.get(apiUrl(API_CONFIG.ENDPOINTS.VENDORS.GET_ALL) + user.id),
          axios.get(apiUrl(API_CONFIG.ENDPOINTS.CUSTOMERS.GET_ALL) + user.id),
          axios.get(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_REGIONS_STATS), { withCredentials: true }),
          axios.get(apiUrl(API_CONFIG.ENDPOINTS.TRANSACTIONS.ANALYTICS), { withCredentials: true }),
          axios.get(apiUrl(API_CONFIG.ENDPOINTS.WITHDRAWALS.GET_ALL) + user.id),
        ])

        if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.data?.orders || [])
        if (productsRes.status === 'fulfilled') setProducts(productsRes.value.data?.products || [])
        if (deliveryMenRes.status === 'fulfilled') setDeliveryMen(deliveryMenRes.value.data?.deliveryMen || deliveryMenRes.value.data || [])
        if (deliveryReqRes.status === 'fulfilled') setDeliveryRequests(deliveryReqRes.value.data?.requests || deliveryReqRes.value.data?.deliveryRequests || [])
        if (vendorsRes.status === 'fulfilled') setVendors(vendorsRes.value.data?.vendors || [])
        if (customersRes.status === 'fulfilled') setCustomers(customersRes.value.data?.users || [])
        if (regionsRes.status === 'fulfilled') setRegionsOverview(regionsRes.value.data)
        if (txStatsRes.status === 'fulfilled') setTransactionStats(txStatsRes.value.data?.data)
        if (withdrawalsRes.status === 'fulfilled') setWithdrawals(withdrawalsRes.value.data?.withdrawals || [])
      } catch (error) {
        console.error('Dashboard fetch error:', error)
      } finally {
        setIsLoadingExtra(false)
      }
    }
    fetchAll()
  }, [user?.id])

  // ─── Derived Counts ───
  const totals = appState?.totals || { user: 0, vendor: 0, agent: 0, admin: 0 }

  // Period-based counts
  const periodData = appState?.[period]
  const periodCounts = periodData?.counts || {}

  // Order breakdowns
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.orderStatus === 'pending').length
  const approvedOrders = orders.filter(o => o.status === 'approved' || o.orderStatus === 'approved' || o.status === 'confirmed').length
  const deliveredOrders = orders.filter(o => o.status === 'delivered' || o.orderStatus === 'delivered').length
  const totalOrders = orders.length

  // Vendor breakdowns
  const activeSellers = vendors.filter(v => v.status === 'active' || !v.isSuspended).length
  const inactiveSellers = vendors.filter(v => v.status === 'inactive' || v.isSuspended).length

  // Customer breakdowns
  const activeCustomers = customers.filter(c => c.status === 'active' || !c.isSuspended).length
  const inactiveCustomers = customers.filter(c => c.status === 'inactive' || c.isSuspended).length

  // Online/Offline (approximation based on recent activity)
  const onlineUsers = periodCounts?.online || periodCounts?.user || 0
  const offlineUsers = (totals.user || 0) - onlineUsers

  // New Metrics
  const pendingWithdrawalsCount = withdrawals.filter(w => w.status === 'pending').length
  const pendingDeliveriesCount = deliveryRequests.filter(r =>
    r.status === 'pending'
  ).length

  // Delivery man and tasks
  const totalDeliveryMen = Array.isArray(deliveryMen) ? deliveryMen.length : 0
  const totalDeliveryTasks = Array.isArray(deliveryRequests) ? deliveryRequests.length : 0

  // Total products
  const totalProducts = Array.isArray(products) ? products.length : 0

  // Wallet / earnings
  const totalEarnings = transactionStats?.total || 0
  const successfulTx = transactionStats?.successful || 0

  // Region stats
  const sortedRegions = regionsOverview?.regions
    ? [...regionsOverview.regions].sort((a: any, b: any) => (b.totalMembers || 0) - (a.totalMembers || 0))
    : []

  return (
    <div className='space-y-8'>
      {/* ═══ Period Toggle ═══ */}
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h2 className='text-lg font-semibold tracking-tight'>At a Glance</h2>
          <p className='text-sm text-muted-foreground'>Quick stats overview</p>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className='w-[160px]'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='today'>Today</SelectItem>
            <SelectItem value='thisWeek'>This Week</SelectItem>
            <SelectItem value='thisMonth'>This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ═══ Row 1 — User Activity Cards ═══ */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {/* 1: Pending Withdrawal */}
        <StatCard
          title='Pending Withdrawal'
          value={isLoadingExtra ? '...' : pendingWithdrawalsCount}
          subtitle='Awaiting processing'
          icon={<Wallet className='h-4 w-4' />}
          accentClass='text-amber-500'
          bgClass='bg-amber-500/10'
          linkTo='/withdrawal-requests'
        />

        {/* 2: Pending Delivery */}
        <StatCard
          title='Pending Delivery'
          value={isLoadingExtra ? '...' : pendingDeliveriesCount}
          subtitle='Awaiting Assignment'
          icon={<Truck className='h-4 w-4' />}
          accentClass='text-blue-500'
          bgClass='bg-blue-500/10'
          linkTo='/delivery-requests'
        />

        {/* Total Users */}
        <StatCard
          title='Total Users'
          value={isStateLoading ? '...' : totals.user}
          subtitle='All registered'
          icon={<Users className='h-4 w-4' />}
          accentClass='text-blue-500'
          bgClass='bg-blue-500/10'
        />

        {/* Total Admins */}
        <StatCard
          title='Total Admins'
          value={isStateLoading ? '...' : totals.admin}
          subtitle='System admins'
          icon={<ShieldCheck className='h-4 w-4' />}
          accentClass='text-purple-500'
          bgClass='bg-purple-500/10'
        />
      </div>

      {/* ═══ Row 2 — Orders ═══ */}
      <div>
        <h3 className='mb-3 text-base font-semibold flex items-center gap-2'>
          <ShoppingCart className='h-4 w-4' />
          Orders Overview
        </h3>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
          <StatCard
            title='Total Orders'
            value={isLoadingExtra ? '...' : totalOrders}
            subtitle='All orders'
            icon={<ShoppingCart className='h-4 w-4' />}
            accentClass='text-indigo-500'
            bgClass='bg-indigo-500/10'
            linkTo='/orders'
          />
          <StatCard
            title='Pending'
            value={isLoadingExtra ? '...' : pendingOrders}
            subtitle='Awaiting action'
            icon={<Clock className='h-4 w-4' />}
            accentClass='text-amber-500'
            bgClass='bg-amber-500/10'
            linkTo='/orders'
          />
          <StatCard
            title='Approved'
            value={isLoadingExtra ? '...' : approvedOrders}
            subtitle='Confirmed orders'
            icon={<CheckCircle2 className='h-4 w-4' />}
            accentClass='text-sky-500'
            bgClass='bg-sky-500/10'
            linkTo='/orders'
          />
          <StatCard
            title='Delivered'
            value={isLoadingExtra ? '...' : deliveredOrders}
            subtitle='Completed'
            icon={<PackageCheck className='h-4 w-4' />}
            accentClass='text-emerald-500'
            bgClass='bg-emerald-500/10'
            linkTo='/orders'
          />
          <Link to='/orders' className='contents'>
            <Card className='group transition-all hover:shadow-md hover:border-primary/30 cursor-pointer'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>View & Update</CardTitle>
                <div className='rounded-full bg-primary/10 p-1.5'>
                  <Eye className='h-4 w-4 text-primary' />
                </div>
              </CardHeader>
              <CardContent>
                <div className='text-sm font-medium text-primary group-hover:underline'>Go to Orders →</div>
                <p className='text-xs text-muted-foreground mt-1'>Manage all orders</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* ═══ Row 3 — Products, Sellers, Customers ═══ */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {/* 5: Total Products */}
        <StatCard
          title='Total Products'
          value={isLoadingExtra ? '...' : totalProducts}
          subtitle='In-house + vendor'
          icon={<Package className='h-4 w-4' />}
          accentClass='text-violet-500'
          bgClass='bg-violet-500/10'
          linkTo='/products'
        />

        {/* 6: Total Sellers Active */}
        <StatCard
          title='Sellers Active'
          value={isLoadingExtra ? '...' : activeSellers}
          subtitle='Currently active'
          icon={<Store className='h-4 w-4' />}
          accentClass='text-emerald-600'
          bgClass='bg-emerald-600/10'
          linkTo='/vendors'
        />

        {/* 7: Total Sellers Inactive */}
        <StatCard
          title='Sellers Inactive'
          value={isLoadingExtra ? '...' : inactiveSellers}
          subtitle='Suspended / inactive'
          icon={<XCircle className='h-4 w-4' />}
          accentClass='text-red-500'
          bgClass='bg-red-500/10'
          linkTo='/vendors'
        />

        {/* Total Vendors */}
        <StatCard
          title='Total Vendors'
          value={isStateLoading ? '...' : totals.vendor}
          subtitle='All vendors'
          icon={<Store className='h-4 w-4' />}
          accentClass='text-orange-500'
          bgClass='bg-orange-500/10'
          linkTo='/vendors'
        />
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {/* 9: Total Customers Active */}
        <StatCard
          title='Customers Active'
          value={isLoadingExtra ? '...' : activeCustomers}
          subtitle='Currently active'
          icon={<UserCheck className='h-4 w-4' />}
          accentClass='text-teal-500'
          bgClass='bg-teal-500/10'
          linkTo='/customers'
        />

        {/* 8: Total Customers Inactive */}
        <StatCard
          title='Customers Inactive'
          value={isLoadingExtra ? '...' : inactiveCustomers}
          subtitle='Suspended / inactive'
          icon={<UserX className='h-4 w-4' />}
          accentClass='text-rose-500'
          bgClass='bg-rose-500/10'
          linkTo='/customers'
        />

        {/* 9: Total Delivery Man */}
        <StatCard
          title='Delivery Men'
          value={isLoadingExtra ? '...' : totalDeliveryMen}
          subtitle='All delivery personnel'
          icon={<Truck className='h-4 w-4' />}
          accentClass='text-cyan-500'
          bgClass='bg-cyan-500/10'
          linkTo='/delivery-management'
        />

        {/* 10: Total Delivery Tasks */}
        <StatCard
          title='Delivery Tasks'
          value={isLoadingExtra ? '...' : totalDeliveryTasks}
          subtitle='All requests'
          icon={<ClipboardList className='h-4 w-4' />}
          accentClass='text-fuchsia-500'
          bgClass='bg-fuchsia-500/10'
          linkTo='/delivery-requests'
        />
      </div>

      {/* ═══ Row 4 — Wallet / Earnings ═══ */}
      <div>
        <h3 className='mb-3 text-base font-semibold flex items-center gap-2'>
          <Wallet className='h-4 w-4' />
          Earnings & Wallets
        </h3>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4'>
          {/* 11: Admin Wallet All Earnings */}
          <Card className='relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg'>
            <div className='absolute top-0 right-0 h-24 w-24 rounded-full bg-white/10 -translate-y-8 translate-x-8' />
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-emerald-100'>Admin Wallet</CardTitle>
              <Wallet className='h-5 w-5 text-emerald-200' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>₦{totalEarnings.toLocaleString()}</div>
              <p className='text-xs text-emerald-200 mt-1'>All Earnings</p>
            </CardContent>
          </Card>

          {/* 12: In-house Earnings */}
          <Card className='relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg'>
            <div className='absolute top-0 right-0 h-24 w-24 rounded-full bg-white/10 -translate-y-8 translate-x-8' />
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-blue-100'>In-house Earnings</CardTitle>
              <CircleDollarSign className='h-5 w-5 text-blue-200' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>₦{(transactionStats?.inHouse || 0).toLocaleString()}</div>
              <p className='text-xs text-blue-200 mt-1'>Wallet balance</p>
            </CardContent>
          </Card>

          {/* 13: Commission Wallet — Sale charges */}
          <Card className='relative overflow-hidden border-0 bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg'>
            <div className='absolute top-0 right-0 h-24 w-24 rounded-full bg-white/10 -translate-y-8 translate-x-8' />
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-amber-100'>Commission (Sales)</CardTitle>
              <Percent className='h-5 w-5 text-amber-200' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>₦{(transactionStats?.commission || 0).toLocaleString()}</div>
              <p className='text-xs text-amber-200 mt-1'>Tax + % on categories</p>
            </CardContent>
          </Card>

          {/* 14 & 15: Commission Wallet Subscription + Delivery */}
          <Card className='relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-lg'>
            <div className='absolute top-0 right-0 h-24 w-24 rounded-full bg-white/10 -translate-y-8 translate-x-8' />
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-purple-100'>Commission (Sub + Delivery)</CardTitle>
              <Receipt className='h-5 w-5 text-purple-200' />
            </CardHeader>
            <CardContent>
              <div className='text-lg font-bold'>
                <span className='text-xs text-purple-200 mr-1'>Sub:</span> ₦{(transactionStats?.subscription || 0).toLocaleString()}
              </div>
              <div className='text-lg font-bold'>
                <span className='text-xs text-purple-200 mr-1'>Del:</span> ₦{(transactionStats?.delivery || 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ═══ Row 5 — Top Region & Top Team ═══ */}
      <div className='grid gap-6 lg:grid-cols-2'>
        {/* Top Region with Most Users */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Globe className='h-5 w-5 text-primary' />
              Top Regions with Most Users
            </CardTitle>
            <CardDescription>Regions ranked by active user count</CardDescription>
          </CardHeader>
          <CardContent>
            {!regionsOverview ? (
              <div className='flex items-center justify-center py-8'>
                <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
              </div>
            ) : sortedRegions.length > 0 ? (
              <div className='space-y-3'>
                {sortedRegions.map((region: any, index: number) => (
                  <div
                    key={region._id}
                    className='flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50'
                  >
                    <div className='flex items-center gap-3'>
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${index === 0 ? 'bg-amber-500/20 text-amber-600' :
                        index === 1 ? 'bg-slate-300/30 text-slate-600' :
                          index === 2 ? 'bg-orange-400/20 text-orange-600' :
                            'bg-muted text-muted-foreground'
                        }`}>
                        {index < 3 ? <Crown className='h-4 w-4' /> : index + 1}
                      </div>
                      <div>
                        <p className='text-sm font-medium'>{region.name}</p>
                        <p className='text-xs text-muted-foreground'>{region.code}</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge variant='secondary' className='font-mono'>
                        {region.totalMembers} <UserCheck className='ml-1 h-3 w-3 text-emerald-500' />
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-sm text-muted-foreground text-center py-8'>No region data available</p>
            )}
          </CardContent>
        </Card>

        {/* Top Team with Most Users (using subregions/states as teams) */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <MapPin className='h-5 w-5 text-primary' />
              Top Teams with Most Users
            </CardTitle>
            <CardDescription>States ranked by active user count</CardDescription>
          </CardHeader>
          <CardContent>
            {!regionsOverview ? (
              <div className='flex items-center justify-center py-8'>
                <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
              </div>
            ) : sortedRegions.length > 0 ? (
              <div className='space-y-3'>
                {sortedRegions.slice(0, 8).map((region: any, index: number) => (
                  <div
                    key={region._id}
                    className='flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50'
                  >
                    <div className='flex items-center gap-3'>
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${index === 0 ? 'bg-amber-500/20 text-amber-600' :
                        index === 1 ? 'bg-slate-300/30 text-slate-600' :
                          index === 2 ? 'bg-orange-400/20 text-orange-600' :
                            'bg-muted text-muted-foreground'
                        }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className='text-sm font-medium'>{region.name}</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge variant='secondary' className='font-mono'>
                        {region.totalMembers} <UserCheck className='ml-1 h-3 w-3 text-emerald-500' />
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-sm text-muted-foreground text-center py-8'>No team data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Reusable Stat Card ───
function StatCard({
  title,
  value,
  subtitle,
  icon,
  accentClass = 'text-primary',
  bgClass = 'bg-primary/10',
  linkTo,
}: {
  title: string
  value: string | number
  subtitle: string
  icon: React.ReactNode
  accentClass?: string
  bgClass?: string
  linkTo?: string
}) {
  const content = (
    <Card className={`transition-all hover:shadow-md ${linkTo ? 'cursor-pointer hover:border-primary/30' : ''}`}>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium text-muted-foreground'>{title}</CardTitle>
        <div className={`rounded-full p-1.5 ${bgClass}`}>
          <span className={accentClass}>{icon}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{value}</div>
        <p className='text-xs text-muted-foreground mt-1'>{subtitle}</p>
      </CardContent>
    </Card>
  )

  if (linkTo) {
    return <Link to={linkTo} className='contents'>{content}</Link>
  }
  return content
}
