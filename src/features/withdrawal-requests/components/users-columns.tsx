import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type DeliveryRequest as WithdrawalRequest } from '../types'
import { DataTableRowActions } from './data-table-row-actions'

export const usersColumns: ColumnDef<WithdrawalRequest>[] = [
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
    accessorKey: 'transactionId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Transaction ID' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36'>{row.getValue('transactionId')}</LongText>
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

      return <div className='font-medium whitespace-nowrap'>{formatted}</div>
    },
  },
  {
    accessorKey: 'chargeAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Charge' />
    ),
    cell: ({ row }) => {
      const rawAmount = row.getValue('chargeAmount')
      if (rawAmount === null || rawAmount === undefined) {
        return <div className='font-medium whitespace-nowrap'>no charges</div>
      }

      const amount = parseFloat(rawAmount as string)
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'NGN',
      }).format(amount)

      return <div className='font-medium whitespace-nowrap'>{formatted}</div>
    },
  },
  {
    accessorKey: 'netAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Net Amount' />
    ),
    cell: ({ row }) => {
      const netAmount = row.getValue('netAmount')
      if (netAmount === null || netAmount === undefined) {
        return (
          <div className='font-medium whitespace-nowrap'>no net amount</div>
        )
      }

      const amount = parseFloat(netAmount as string)
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'NGN',
      }).format(amount)

      return <div className='font-medium whitespace-nowrap'>{formatted}</div>
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

      /* const variant =
        status === 'pending'
          ? 'secondary'
          : status === 'cancelled'
            ? 'destructive'
            : status === 'delivered'
              ? 'default'
              : 'outline'
      */ return (
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
      <DataTableColumnHeader column={column} title='Date' />
    ),
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
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
]
