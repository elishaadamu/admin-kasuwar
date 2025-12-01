// @ts-nocheck
import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { UsersDataTableRowActions } from './users-data-table-row-actions'

export type Banner = {
  _id: string
  title: string
  link?: string
  offer?: string
  image: {
    public_id: string
    url: string
  }
}

export const usersColumns: ColumnDef<Banner>[] = [
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
    accessorKey: 'image',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Image' />
    ),
    cell: ({ row }) => (
      <img
        src={row.original.image.url}
        alt={row.original.title}
        className='h-12 w-24 rounded-md object-cover'
      />
    ),
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    cell: ({ row }) => <div>{row.getValue('title')}</div>,
  },
  {
    accessorKey: 'link',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Link' />
    ),
    cell: ({ row }) => (
      <a
        href={row.getValue('link')}
        target='_blank'
        rel='noopener noreferrer'
        className='text-blue-500 hover:underline'
      >
        {row.getValue('link')}
      </a>
    ),
  },
  {
    accessorKey: 'offer',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Offer' />
    ),
    cell: ({ row }) => <div>{row.getValue('offer')}</div>,
  },
  {
    id: 'actions',
    cell: ({ row }) => <UsersDataTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
]
