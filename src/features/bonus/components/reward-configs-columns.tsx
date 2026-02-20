import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { RewardConfig } from './reward-configs-list'
import { RewardConfigRowActions } from './reward-configs-row-actions'

export const rewardConfigsColumns: ColumnDef<RewardConfig>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => (
      <div className='flex space-x-2'>
        <span className='max-w-[500px] truncate font-medium'>
          {row.getValue('name') || 'N/A'}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'event',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Event' />
    ),
    cell: ({ row }) => {
      const event = row.getValue('event') as string
      if (!event) return null
      const formattedEvent = event.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      return (
        <Badge variant='outline' className='capitalize'>
          {formattedEvent}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'regionAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Region Amount' />
    ),
    cell: ({ row }) => {
      const amountValue = row.getValue('regionAmount')
      const amount = amountValue ? parseFloat(amountValue as string) : 0
      const formatted = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(amount)
      return <div className='font-medium'>{formatted}</div>
    },
  },
  {
    accessorKey: 'teamAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Team Amount' />
    ),
    cell: ({ row }) => {
      const amountValue = row.getValue('teamAmount')
      const amount = amountValue ? parseFloat(amountValue as string) : 0
      const formatted = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(amount)
      return <div className='font-medium'>{formatted}</div>
    },
  },
  {
    accessorKey: 'enabled',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Enabled' />
    ),
    cell: ({ row }) => {
      const isEnabled = row.getValue('enabled') as boolean
      return (
        <Badge variant={isEnabled ? 'default' : 'secondary'}>
          {isEnabled ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <RewardConfigRowActions row={row} />,
  },
]
