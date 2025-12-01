// @ts-nocheck
import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { LongText } from '@/components/long-text'
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
    accessorKey: 'name',
    header: 'Product',
    cell: ({ row }) => {
      const images = row.original.images || []
      return (
        <div className='flex items-center gap-2'>
          {images.length > 0 && (
            <img
              src={images[0].url}
              alt={row.getValue('name')}
              className='h-10 w-10 rounded-md object-cover'
            />
          )}
          <LongText className='max-w-36'>{row.getValue('name')}</LongText>
        </div>
      )
    },
    meta: { className: 'w-72' },
  },
  {
    accessorKey: 'category',
    header: 'Category',
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('price'))
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'NGN',
      }).format(amount)

      return <div className='font-medium'>{formatted}</div>
    },
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
  },
  {
    accessorKey: 'condition',
    header: 'Condition',
  },
  {
    accessorKey: 'approved',
    header: 'Status',
    cell: ({ row }) => {
      const isApproved = row.getValue('approved')
      const status = isApproved ? 'Approved' : 'Pending'
      return (
        <Badge variant={isApproved ? 'default' : 'outline'}>{status}</Badge>
      )
    },
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
