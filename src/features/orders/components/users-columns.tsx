// @ts-nocheck
import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { LongText } from '@/components/long-text'
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
    accessorKey: '_id',
    header: 'Order ID',
    cell: ({ row }) => <div className='font-medium'>{row.getValue('_id')}</div>,
  },
  {
    accessorKey: 'products',
    header: 'Products',
    cell: ({ row }) => {
      const products = row.original.products || []
      const productNames = products.map((p) => p.name).join(', ')
      return <LongText className='max-w-xs'>{productNames}</LongText>
    },
  },
  {
    accessorKey: 'totalAmount',
    header: 'Total Amount',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('totalAmount'))
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'NGN',
      }).format(amount)

      return <div className='font-medium whitespace-nowrap'>{formatted}</div>
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: { row: any }) => {
      const status = row.getValue('status') as string
      return (
        <Badge
          className={cn({
            'bg-yellow-200 text-yellow-900 hover:bg-yellow-200/80 dark:bg-yellow-900/30 dark:text-yellow-300':
              status === 'pending',
            'bg-blue-200 text-blue-900 hover:bg-blue-200/80 dark:bg-blue-900/30 dark:text-blue-300':
              status === 'paid',
            'bg-green-200 text-green-900 hover:bg-green-200/80 dark:bg-green-900/30 dark:text-green-300':
              status === 'delivered',
          })}
        >
          <span className='capitalize'>{status}</span>
        </Badge>
      )
    },
  },

  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => {
      const dateString = row.getValue('createdAt') as string
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    },
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
