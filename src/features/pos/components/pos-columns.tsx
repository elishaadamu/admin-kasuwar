import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { type PosOrder } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

function decodeHtml(html: string) {
  return html.replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"')
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-200 text-yellow-900 hover:bg-yellow-200/80 dark:bg-yellow-900/30 dark:text-yellow-300',
  pending_payment: 'bg-orange-200 text-orange-900 hover:bg-orange-200/80 dark:bg-orange-900/30 dark:text-orange-300',
  submitted: 'bg-blue-200 text-blue-900 hover:bg-blue-200/80 dark:bg-blue-900/30 dark:text-blue-300',
  confirmed: 'bg-green-200 text-green-900 hover:bg-green-200/80 dark:bg-green-900/30 dark:text-green-300',
  cancelled: 'bg-red-200 text-red-900 hover:bg-red-200/80 dark:bg-red-900/30 dark:text-red-300',
}

export const posColumns: ColumnDef<PosOrder>[] = [
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
    accessorKey: 'uniqueOrderCode',
    header: 'Order Code',
    cell: ({ row }) => (
      <div className='font-mono font-semibold'>{row.getValue('uniqueOrderCode')}</div>
    ),
  },
  {
    id: 'salesManager',
    header: 'Sales Manager',
    cell: ({ row }) => {
      const sm = row.original.salesManager
      if (!sm) return <span className='text-muted-foreground italic'>N/A</span>
      return (
        <div className='flex flex-col'>
          <span className='font-medium'>{sm.firstName} {sm.lastName}</span>
          <span className='text-xs text-muted-foreground'>{sm.phone}</span>
        </div>
      )
    },
  },
  {
    id: 'products',
    header: 'Products',
    cell: ({ row }) => {
      const products = row.original.products || []
      return (
        <div className='flex flex-col gap-0.5 max-w-[180px]'>
          {products.map((p) => (
            <span key={p._id} className='truncate text-sm'>
              {decodeHtml(p.name)} <span className='text-muted-foreground'>x{p.quantity}</span>
            </span>
          ))}
        </div>
      )
    },
  },
  {
    accessorKey: 'totalAmount',
    header: 'Amount',
    cell: ({ row }) => {
      const amount = row.getValue('totalAmount') as number
      return (
        <div className='font-semibold whitespace-nowrap'>
          {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)}
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge className={cn(STATUS_STYLES[status] ?? 'bg-gray-200 text-gray-900')}>
          <span className='capitalize whitespace-nowrap'>{status.replace(/_/g, ' ')}</span>
        </Badge>
      )
    },
  },
  {
    accessorKey: 'paymentStatus',
    header: 'Payment',
    cell: ({ row }) => {
      const status = row.getValue('paymentStatus') as string
      return (
        <Badge
          className={cn({
            'bg-yellow-200 text-yellow-900 hover:bg-yellow-200/80 dark:bg-yellow-900/30 dark:text-yellow-300':
              status === 'pending',
            'bg-green-200 text-green-900 hover:bg-green-200/80 dark:bg-green-900/30 dark:text-green-300':
              status === 'paid',
          })}
        >
          <span className='capitalize'>{status}</span>
        </Badge>
      )
    },
  },
  {
    id: 'customer',
    header: 'Customer',
    cell: ({ row }) => {
      const name = row.original.customerName
      const phone = row.original.customerPhone
      return (
        <div className='flex flex-col'>
          <span className='font-medium'>{name || <span className='text-muted-foreground italic text-sm'>Guest</span>}</span>
          {phone && <span className='text-xs text-muted-foreground'>{phone}</span>}
        </div>
      )
    },
  },
  {
    id: 'location',
    header: 'Delivery Location',
    cell: ({ row }) => {
      const { state, lga } = row.original
      if (!state) return <span className='text-muted-foreground italic text-sm'>N/A</span>
      return (
        <div className='flex flex-col text-sm'>
          <span className='font-medium'>{state}</span>
          {lga && <span className='text-xs text-muted-foreground'>{lga}</span>}
        </div>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => {
      const raw = row.getValue('createdAt')
      if (!raw) return 'N/A'
      const date = new Date(raw as string | Date)
      if (isNaN(date.getTime())) return 'N/A'
      return (
        <span className='whitespace-nowrap text-sm'>
          {date.toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
