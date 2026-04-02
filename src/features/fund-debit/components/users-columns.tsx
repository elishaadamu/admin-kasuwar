import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type FundDebitUser } from '../types'
import { DataTableRowActions } from './data-table-row-actions'

export const usersColumns: ColumnDef<FundDebitUser>[] = [
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
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      const name = row.getValue('name') as string
      const firstName = (row.original as any).firstName
      const lastName = (row.original as any).lastName
      const displayName = name || (firstName && lastName ? `${firstName} ${lastName}`.trim() : 'N/A')
      return <LongText className='max-w-36'>{displayName}</LongText>
    },
    meta: { className: 'w-48' },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => <LongText className='max-w-48'>{row.getValue('email')}</LongText>,
    meta: { className: 'w-48' },
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Phone' />
    ),
    cell: ({ row }) => <div>{row.getValue('phone') || 'N/A'}</div>,
    enableSorting: false,
    meta: { className: 'w-32' },
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Role' />
    ),
    cell: ({ row }) => {
      const role = (row.getValue('role') as string) || 'N/A'
      return (
        <Badge variant='outline' className='capitalize'>
          {role.replace('-', ' ')}
        </Badge>
      )
    },
    enableSorting: false,
    filterFn: (row, _, value) => {
      return value.includes(row.getValue('role'))
    },
    meta: { className: 'w-32' },
  },
  {
    accessorKey: 'walletBalance',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Wallet Balance' />
    ),
    cell: ({ row }) => {
      const balance = row.getValue('walletBalance') as number | undefined
      return (
        <div className={cn('font-semibold', balance && balance > 0 ? 'text-green-600' : 'text-muted-foreground')}>
          {balance ? `₦${balance.toLocaleString()}` : '₦0.00'}
        </div>
      )
    },
    enableSorting: false,
    meta: { className: 'w-32 text-right' },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = (row.getValue('status') as string) || (row.original as any).suspended ? 'suspended' : 'active'
      const variant =
        status === 'active'
          ? 'default'
          : status === 'suspended'
            ? 'destructive'
            : status === 'pending'
              ? 'secondary'
              : 'outline'
      return (
        <Badge variant={variant} className='capitalize'>
          {status}
        </Badge>
      )
    },
    filterFn: (row, _, value) => {
      const status = (row.getValue('status') as string) || (row.original as any).suspended ? 'suspended' : 'active'
      return value.includes(status)
    },
    enableHiding: false,
    enableSorting: false,
    meta: { className: 'w-28' },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
]
