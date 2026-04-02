// @ts-nocheck
import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { callTypes, roles } from '../data/data'
import { type User } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { DataTableViewOptions } from '@/components/data-table/view-options'

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
    id: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      const { name, firstName, lastName, isTeamLead } = row.original
      const fullName = name || `${firstName || ''} ${lastName || ''}`.trim()
      return (
        <div className='flex items-center gap-2'>
          <LongText className='max-w-36'>{fullName}</LongText>
          {isTeamLead && (
            <Badge variant='secondary' className='bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200'>
              Lead
            </Badge>
          )}
        </div>
      )
    },
    meta: { className: 'w-48' },
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
      <DataTableColumnHeader column={column} title='Phone' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap'>{row.getValue('phone')}</div>
    ),
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Role' />
    ),
    cell: ({ row }) => {
      const role = row.getValue('role') as string
      return (
        <Badge variant='outline' className='capitalize'>
          {role || '-'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'walletBalance',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Wallet Balance' />
    ),
    cell: ({ row }) => {
      const balance = row.getValue('walletBalance') as number
      return (
        <div className='font-medium'>
          ₦{balance?.toLocaleString() || '0'}
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Action' />
    ),
    cell: DataTableRowActions,
  },
]
