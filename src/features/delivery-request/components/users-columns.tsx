import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { DeliveryRequest } from '../types'
import { DataTableRowActions } from './data-table-row-actions'

export const usersColumns: ColumnDef<DeliveryRequest>[] = [
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
    accessorKey: 'senderName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Sender Name' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36'>{row.getValue('senderName')}</LongText>
    ),
    meta: { className: 'w-36' },
  },
  {
    accessorKey: 'receipientName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Recipient Name' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap'>{row.getValue('receipientName')}</div>
    ),
  },
  {
    accessorKey: 'senderPhone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Sender Phone' />
    ),
    cell: ({ row }) => <div>{row.getValue('senderPhone')}</div>,
    enableSorting: false,
  },
  {
    accessorKey: 'requestType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Request Type' />
    ),
    cell: ({ row }) => (
      <Badge variant='secondary' className='capitalize'>
        {row.getValue('requestType')}
      </Badge>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'isPaid',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Payment' />
    ),
    cell: ({ row }) => (
      <Badge variant={row.getValue('isPaid') ? 'default' : 'destructive'}>
        {row.getValue('isPaid') ? 'Paid' : 'Unpaid'}
      </Badge>
    ),
    enableSorting: false,
    filterFn: (row, _, value) => {
      const isPaid = row.getValue('isPaid') ? 'paid' : 'unpaid'
      return value.includes(isPaid)
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const variant =
        status === 'pending'
          ? 'secondary'
          : status === 'cancelled'
            ? 'destructive'
            : status === 'delivered'
              ? 'default'
              : 'outline'
      return (
        <div className='flex space-x-2'>
          <Badge variant={variant} className='capitalize'>
            {status}
          </Badge>
        </div>
      )
    },
    filterFn: (row, _, value) => {
      return value.includes(row.getValue('status'))
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
