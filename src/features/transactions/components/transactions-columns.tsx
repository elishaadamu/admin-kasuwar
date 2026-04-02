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

export const transactionsColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: 'reference',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Transaction ID' />
    ),
    cell: ({ row }) => <div className='font-mono text-[10px] uppercase'>{row.getValue('reference') || row.original._id}</div>,
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Amounts' />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'))
      return <div className='font-bold'>₦{amount.toLocaleString()}</div>
    },
  },
  {
    accessorKey: 'userDetails',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='User Name' />
    ),
    cell: ({ row }) => {
      const details = row.original.userDetails
      if (!details) return <div className='text-muted-foreground'>System</div>
      return (
        <div className='flex flex-col'>
          <span className='font-medium'>{details.firstName} {details.lastName}</span>
          <span className='text-[10px] text-muted-foreground'>{details.email || details.phone}</span>
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
      return (
        <Badge variant='outline' className={cn('capitalize', statusStyles[status] || '')}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Date & time' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date
      return (
        <div className='flex flex-col text-xs'>
          <span>{new Date(date).toLocaleDateString()}</span>
          <span className='text-muted-foreground'>{new Date(date).toLocaleTimeString()}</span>
        </div>
      )
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

