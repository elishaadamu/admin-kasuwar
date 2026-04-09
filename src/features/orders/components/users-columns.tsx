// @ts-nocheck
import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { type User } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const usersColumns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    meta: {
      className: cn('sticky md:table-cell start-0 z-10 rounded-tl-[inherit]'),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'sn',
    header: 'S/N',
    cell: ({ row }) => <div className='font-medium'>{row.index + 1}</div>,
  },
  {
    accessorKey: '_id',
    header: 'Order ID',
    cell: ({ row }) => {
      const id = row.getValue('_id') as string;
      return <div className='font-medium'>{id ? id.slice(-6).toUpperCase() : 'N/A'}</div>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Date & Time',
    cell: ({ row }) => {
      const dateString = row.getValue('createdAt') as string
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
  },
  {
    id: 'customer',
    header: 'Customer Name & Phone',
    cell: ({ row }) => {
      const user = row.original.user;
      const name = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'N/A';
      const phone = row.original.phone || 'N/A';
      return (
        <div className='flex flex-col'>
          <span className='font-medium whitespace-nowrap'>{name || 'N/A'}</span>
          <span className='text-xs text-muted-foreground whitespace-nowrap'>{phone}</span>
        </div>
      );
    },
  },
  {
    id: 'vendor',
    header: 'Vendor Name & Phone',
    cell: ({ row }) => {
      const vendor = row.original.vendor || row.original.store;
      const vendorName = vendor ? (vendor.storeName || vendor.name || `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim()) : 'N/A';
      const vendorPhone = vendor?.phone || 'N/A';
      
      return (
        <div className='flex flex-col'>
          <span className='font-medium whitespace-nowrap'>{vendorName || 'N/A'}</span>
          <span className='text-xs text-muted-foreground whitespace-nowrap'>{vendorPhone}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'totalAmount',
    header: 'Total Amount',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('totalAmount')) || 0
      const formatted = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(amount)

      return <div className='font-medium whitespace-nowrap'>{formatted}</div>
    },
  },
  {
    accessorKey: 'status',
    header: 'Order Status',
    cell: ({ row }: { row: any }) => {
      const status = row.getValue('status') as string || 'pending'
      return (
        <Badge
          className={cn({
            'bg-yellow-200 text-yellow-900 hover:bg-yellow-200/80 dark:bg-yellow-900/30 dark:text-yellow-300':
              status.toLowerCase() === 'pending',
            'bg-blue-200 text-blue-900 hover:bg-blue-200/80 dark:bg-blue-900/30 dark:text-blue-300':
              status.toLowerCase() === 'paid',
            'bg-green-200 text-green-900 hover:bg-green-200/80 dark:bg-green-900/30 dark:text-green-300':
              status.toLowerCase() === 'delivered' || status.toLowerCase() === 'completed',
            'bg-red-200 text-red-900 hover:bg-red-200/80 dark:bg-red-900/30 dark:text-red-300':
              status.toLowerCase() === 'cancelled',
          })}
        >
          <span className='capitalize'>{status}</span>
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
