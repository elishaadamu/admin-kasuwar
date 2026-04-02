import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type DeliveryRequest as WithdrawalRequest } from '../types'
import { DataTableRowActions } from './data-table-row-actions'

export const usersColumns: ColumnDef<WithdrawalRequest>[] = [
  {
    accessorKey: 'transactionId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Transaction ID' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36'>{row.getValue('transactionId') || row.original._id}</LongText>
    ),
    meta: { className: 'w-36' },
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Amount' />
    ),
    cell: ({ row }) => {
      const rawAmount = row.getValue('amount')
      if (rawAmount === null || rawAmount === undefined) {
        return <div className='font-medium whitespace-nowrap'>no amount</div>
      }

      const amount = parseFloat(rawAmount as string)
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'NGN',
      }).format(amount)

      return <div className='font-bold whitespace-nowrap'>{formatted}</div>
    },
  },
  {
    id: 'userName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='User Name' />
    ),
    cell: ({ row }) => {
      const details = row.original.userDetails || row.original.user
      if (!details) return <div className='text-muted-foreground'>N/A</div>
      return (
        <div className='flex flex-col'>
          <span className='font-medium'>{details.firstName} {details.lastName}</span>
          <span className='text-xs text-muted-foreground'>{details.email || details.phone}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      let variant: 'secondary' | 'destructive' | 'default' | 'outline' =
        'outline'
      if (status === 'pending') {
        variant = 'secondary'
      } else if (status === 'approved' || status === 'completed') {
        variant = 'default'
      } else if (status === 'rejected' || status === 'cancelled') {
        variant = 'destructive'
      }

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
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Date & Time' />
    ),
    cell: ({ row }) => {
      const dateString = row.getValue('createdAt') as string
      if (!dateString) return 'N/A'
      return (
        <div className='flex flex-col text-xs'>
          <span>{new Date(dateString).toLocaleDateString()}</span>
          <span className='text-muted-foreground'>{new Date(dateString).toLocaleTimeString()}</span>
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Actions' />
    ),
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
]

