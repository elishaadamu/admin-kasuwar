import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { format } from 'date-fns'

export interface RewardActivity {
  _id: string
  event: string
  referenceId: string
  status: string
  notes?: string
  distributed: Array<{
    userId: string
    role: string
    amount: number
  }>
  createdAt: string
  updatedAt: string
}

export const rewardActivitiesColumns: ColumnDef<RewardActivity>[] = [
  {
    accessorKey: 'event',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Event' />
    ),
    cell: ({ row }) => {
      const event = row.getValue('event') as string
      const formatted = event?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      return <div className='font-medium'>{formatted || 'N/A'}</div>
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
        <Badge
          variant={
            status === 'success' || status === 'completed'
              ? 'default'
              : status === 'pending'
              ? 'secondary'
              : 'destructive'
          }
          className='capitalize'
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'notes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Notes/Message' />
    ),
    cell: ({ row }) => {
      const notes = row.getValue('notes') as string
      return (
        <div className='max-w-[300px] truncate text-xs text-muted-foreground' title={notes}>
          {notes || '-'}
        </div>
      )
    },
  },
  {
    accessorKey: 'distributed',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total Distributed' />
    ),
    cell: ({ row }) => {
      const distributed = row.original.distributed || []
      const total = distributed.reduce((acc, curr) => acc + (curr.amount || 0), 0)
      const formatted = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(total)
      
      return (
        <div className='flex flex-col'>
          <span className='font-medium'>{formatted}</span>
          <span className='text-[10px] text-muted-foreground'>{distributed.length} recipients</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'referenceId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ref ID' />
    ),
    cell: ({ row }) => (
      <div className='text-xs font-mono text-muted-foreground'>
        {row.getValue('referenceId')}
      </div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Date' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string
      return (
        <div className='text-sm text-muted-foreground'>
          {date ? format(new Date(date), 'PPp') : 'N/A'}
        </div>
      )
    },
  },
]
