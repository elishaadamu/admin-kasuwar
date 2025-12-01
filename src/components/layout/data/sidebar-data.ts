import {
  ArrowLeftRight,
  ClipboardList,
  FileText,
  History,
  LayoutDashboard,
  Package,
  Settings,
  UserCog,
  ImageIcon,
} from 'lucide-react'
import { UserPlus } from 'lucide-react'
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
          title: 'Category',
          icon: History,
          items: [{ title: 'All Categories', url: '/category' }],
        },
        {
          title: 'Product Management',
          icon: History,
          items: [
            { title: 'All Products', url: '/products' },
            { title: 'All Vendor Products', url: '/vendor-products' },
          ],
        },
        {
          title: 'Order Management',
          icon: Package,
          items: [{ title: 'All Orders', url: '/orders' }],
        },

        // {
        //   title: 'Help & Support',
        //   icon: Ticket,
        //   items: [
        //     { title: 'Inbox', url: '/support/inbox' },
        //     { title: 'Tickets', url: '/support/tickets' },
        //   ],
        // },
        {
          title: 'Customer Management',
          icon: UserPlus,
          items: [{ title: ' Customers', url: '/customers' }],
        },
        {
          title: 'Seller Management',
          icon: UserCog,
          items: [{ title: 'Manage Sellers', url: '/vendors' }],
        },
        {
          title: 'Delivery Management',
          icon: UserCog,
          items: [
            { title: ' Delivery Men', url: '/delivery-management' },
            { title: 'Delivery Requests', url: '/delivery-requests' },
          ],
        },
        // {
        //   title: 'Task Management',
        //   icon: ListTodo,
        //   items: [
        //     { title: 'Assign Task', url: '/tasks/assign' },
        //     { title: 'View Reports', url: '/tasks/reports' },
        //   ],
        // },

        {
          title: 'Team management',
          icon: UserCog,
          items: [
            {
              title: 'Manage Agents',
              url: '/agents',
            },
            { title: 'Manage Developers', url: '/bdm' },
          ],
        },
        {
          title: 'Reports & Performance',
          icon: FileText,
          items: [
            { title: 'BDMs Report', url: '/reports/bdms' },
            { title: 'BDs Report', url: '/reports/bds' },
          ],
        },
        {
          title: 'Transfers & Withdrawal',
          icon: ArrowLeftRight,
          items: [
            { title: 'Fund/Debit Wallet', url: '/fund-debit' },
            // { title: 'History', url: '/transaction-history' },
            {
              title: 'Withdrawal Requests',
              url: '/withdrawal-requests',
            },
          ],
        },

        {
          title: 'Coupons',
          icon: ClipboardList,
          url: '/coupons',
        },

        {
          title: 'Banners',
          icon: ImageIcon,
          url: '/banners',
        },
      ],
    },
    {
      title: 'Settings',
      items: [
        // {
        //   title: 'Auth',
        //   icon: ShieldCheck,
        //   items: [{ title: 'Sign In', url: '/sign-in' }],
        // },
        {
          title: 'Settings',
          icon: Settings,
          items: [
            { title: 'Account Profile', url: '/settings/account' },

            { title: 'Shipping methods', url: '/settings/shipping-methods' },
            { title: 'Subscription', url: '/settings/subscription' },
          ],
        },
      ],
    },
  ],
}
