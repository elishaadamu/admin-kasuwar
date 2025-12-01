import { type ColumnDef } from '@tanstack/react-table'
import { DataTableRowActions } from './data-table-row-actions'
import { type Subscription } from './schema'

export const columns: ColumnDef<Subscription>[] = [
  {
    accessorKey: 'name',
    header: 'Package Name',
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => (
      <div className='max-w-[200px] truncate'>
        {row.getValue('description')}
      </div>
    ),
  },
  {
    accessorKey: 'duration',
    header: 'Duration (days)',
  },
  {
    accessorKey: 'products',
    header: 'Products Limit',
    cell: ({ row }) => {
      const products = row.getValue('products') as number
      const displayValue = products === -1 ? 'Unlimited' : products
      return <div className='font-medium'>{displayValue}</div>
    },
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('price'))
      const formatted = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(amount)

      return <div className='font-medium'>{formatted}</div>
    },
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
    meta: {
      className: 'w-16',
    },
  },
]
