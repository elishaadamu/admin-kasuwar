import { type ColumnDef } from '@tanstack/react-table'
import { DataTableRowActions } from './data-table-row-actions'
import { type ShippingRegion } from './schema'

export const columns: ColumnDef<ShippingRegion>[] = [
  {
    accessorKey: 'region',
    header: 'Region',
    cell: ({ row }) => {
      const region = row.getValue('region') as string
      return <div className='capitalize'>{region.replace('-', ' ')}</div>
    },
  },
  {
    accessorKey: 'deliveryType',
    header: 'Delivery Type',
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
    accessorKey: 'duration',
    header: 'Duration',
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
