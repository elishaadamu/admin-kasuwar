import {
  ArrowLeftRight,
  LayoutDashboard,
  Package,
  Settings,
  Users,
  Store,
  Truck,
  UsersRound,
  Tags,
  Image as ImageIcon2,
  Gift,
  TicketPercent,
  MapPin,
  CreditCard
} from 'lucide-react'
import logo from '@/assets/logo.png'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Kasuwar Zamani',
    email: 'info@kasuwarzamani.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Kasuwar Zamani',
      logo: logo,
      plan: 'Business Platform',
    },
  ],
  navGroups: [
    {
      title: 'Management',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Banners',
          icon: ImageIcon2,
          url: '/banners',
        },
        {
          title: 'Bonus & Rewards',
          icon: Gift,
          url: '/bonus',
        },
        {
          title: 'Categories',
          icon: Tags,
          url: '/category',
        },
        {
          title: 'Coupons',
          icon: TicketPercent,
          url: '/coupons',
        },
        {
          title: 'Customers',
          icon: Users,
          url: '/customers',
        },
        {
          title: 'Delivery Management',
          icon: Truck,
          items: [
            { title: 'Delivery Men', url: '/delivery-management' },
            { title: 'Delivery Requests', url: '/delivery-requests' },
          ],
        },
        {
          title: 'All Orders',
          icon: Package,
          url: '/orders',
        },
        {
          title: 'POS Orders',
          icon: Package,
          url: '/pos',
        },
        {
          title: 'Product Management',
          icon: Package, // Consider a different icon if preferred
          items: [
            { title: 'All Products', url: '/products' },
            { title: 'Vendor Products', url: '/vendor-products' },
          ],
        },
        {
          title: 'Sellers / Vendors',
          icon: Store,
          url: '/vendors',
        },
        {
          title: 'Shipping Methods',
          icon: MapPin,
          url: '/settings/shipping-methods',
        },
        {
          title: 'Subscriptions',
          icon: CreditCard,
          url: '/settings/subscription',
        },
        {
          title: 'Team Management',
          icon: UsersRound,
          items: [
            { title: 'Agents', url: '/agents' },
            { title: 'BD/BDM Management', url: '/bdm' },
            { title: 'Sales Managers', url: '/sm' },
            { title: 'HR Management', url: '/hr' },
            { title: 'Regional / Team Leads', url: '/team-members' },
            { title: 'Transactions', url: '/transactions' },
          ],
        },
        {
          title: 'Transfers & Withdrawals',
          icon: ArrowLeftRight,
          items: [
            { title: 'Fund/Debit Wallet', url: '/fund-debit' },
            { title: 'Withdrawal Requests', url: '/withdrawal-requests' },
          ],
        },
      ],
    },
    {
      title: 'Settings',
      items: [
        {
          title: 'Account Settings',
          icon: Settings,
          url: '/settings/account',
        },
      ],
    },
  ],
}
