import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Transaction } from '../data/schema'
import { cn } from '@/lib/utils'
import { TransactionsRowActions } from './transactions-row-actions'

const statusStyles: Record<string, string> = {
  successful: 'bg-green-100 text-green-800 border-green-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  failed: 'bg-red-100 text-red-800 border-red-200',
}

const typeStyles: Record<string, string> = {
  credit: 'text-green-600',
  debit: 'text-red-600',
  transfer: 'text-blue-600',
}

export const transactionsColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: 'reference',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Reference' />
    ),
    cell: ({ row }) => <div className='font-mono text-[10px] uppercase'>{row.getValue('reference') || row.original._id}</div>,
  },
  {
    accessorKey: 'userDetails',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='User' />
    ),
    cell: ({ row }) => {
      const details = row.original.userDetails
      if (!details) return <div className='text-muted-foreground'>System</div>
      return (
        <div className='flex flex-col'>
          <span className='font-medium'>{details.firstName} {details.lastName}</span>
          <span className='text-xs text-muted-foreground'>{details.email}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
    cell: ({ row }) => {
      const type = row.getValue('type') as string
      return (
        <div className={cn('font-medium capitalize', typeStyles[type] || '')}>
          {type}
        </div>
      )
    },
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Amount' />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'))
      return <div className='font-bold'>₦{amount.toLocaleString()}</div>
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge variant='outline' className={cn('capitalize', statusStyles[status] || '')}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'for',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Purpose' />
    ),
    cell: ({ row }) => {
      const purpose = row.getValue('for') as string
      return <div className='capitalize text-xs font-medium bg-muted px-2 py-0.5 rounded'>{purpose?.replace(/_/g, ' ') || '-'}</div>
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Date' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date
      return <div className='text-xs text-muted-foreground'>{new Date(date).toLocaleString()}</div>
    },
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Actions' />
    ),
    cell: TransactionsRowActions,
  },
]
