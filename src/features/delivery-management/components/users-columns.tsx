import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { callTypes } from '../data/data'
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
    id: 'fullName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      const { name } = row.original
      const fullName = name
      return <LongText className='max-w-36'>{fullName}</LongText>
    },
    meta: { className: 'w-36' },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap'>{row.getValue('email')}</div>
    ),
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Phone Number' />
    ),
    cell: ({ row }) => <div>{row.getValue('phone')}</div>,
    enableSorting: false,
  },
  {
    accessorKey: 'walletBalance',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Wallet Balance' />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('walletBalance'))
      const formatted = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(amount)

      return <div className='font-medium'>{formatted}</div>
    },
  },
  {
    accessorKey: 'companyName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Company Name' />
    ),
    cell: ({ row }) => <div>{row.getValue('companyName') || 'N/A'}</div>,
    enableSorting: false,
  },
  {
    accessorKey: 'isApproved',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Approved' />
    ),
    cell: ({ row }) => (
      <Badge variant={row.getValue('isApproved') ? 'default' : 'outline'}>
        {row.getValue('isApproved') ? 'Yes' : 'No'}
      </Badge>
    ),
    enableSorting: false,
    filterFn: (row, id, value) => {
      const isApproved = row.getValue(id) ? 'approved' : 'not_approved'
      return value.includes(isApproved)
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const isSuspended = row.original.suspended
      const status = isSuspended ? 'suspended' : 'active'
      const badgeColor = callTypes.get(status)
      return (
        <div className='flex space-x-2'>
          <Badge variant='outline' className={cn('capitalize', badgeColor)}>
            {status}
          </Badge>
        </div>
      )
    },
    filterFn: (row, value) => {
      const isSuspended = row.original.suspended
      const status = isSuspended ? 'suspended' : 'active'
      return value.includes(status)
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
]
