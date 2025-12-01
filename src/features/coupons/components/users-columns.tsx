import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { UsersDataTableRowActions } from './users-data-table-row-actions'

export type Coupon = {
  _id: string
  code: string
  discountAmount: number
  minimumOrderAmount: number
  validFrom: string
  validUntil: string
  usageLimit: number
  usedCount: number
  isActive: boolean
  createdBy: {
    _id: string
    firstName: string
    lastName: string
    email: string
    role: string
  }
  creatorRole: string
  createdAt: string
  updatedAt: string
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

export const usersColumns: ColumnDef<Coupon>[] = [
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
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Code' />
    ),
    cell: ({ row }) => <div className='font-mono'>{row.getValue('code')}</div>,
  },
  {
    accessorKey: 'discountAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Discount' />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('discountAmount'))
      const formatted = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(amount)
      return <div className='font-medium'>{formatted}</div>
    },
  },
  {
    accessorKey: 'minimumOrderAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Min. Order' />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('minimumOrderAmount'))
      const formatted = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(amount)
      return <div className='font-medium'>{formatted}</div>
    },
  },
  {
    accessorKey: 'usageLimit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Usage' />
    ),
    cell: ({ row }) => {
      const limit = row.original.usageLimit
      const count = row.original.usedCount
      return (
        <div>
          {count} / {limit}
        </div>
      )
    },
  },
  {
    accessorKey: 'validFrom',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Valid From' />
    ),
    cell: ({ row }) => <div>{formatDate(row.getValue('validFrom'))}</div>,
  },
  {
    accessorKey: 'validUntil',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Valid Until' />
    ),
    cell: ({ row }) => <div>{formatDate(row.getValue('validUntil'))}</div>,
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue('isActive')
      return (
        <Badge variant={isActive ? 'default' : 'destructive'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <UsersDataTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
]
