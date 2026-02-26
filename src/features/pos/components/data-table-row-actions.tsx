import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Eye, CheckCircle, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type PosOrder } from '../data/schema'
import { usePos } from './pos-provider'

type DataTableRowActionsProps = {
  row: Row<PosOrder>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = usePos()
  const order = row.original

  // Orders eligible for payment verification: pending or pending_payment, not yet confirmed
  const canVerify = ['pending', 'pending_payment', 'submitted'].includes(order.status)

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[180px]'>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(order)
            setOpen('view')
          }}
        >
          View Details
          <DropdownMenuShortcut>
            <Eye size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        {order.receipt?.url && (
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(order)
              setOpen('receipt')
            }}
          >
            View Receipt
            <DropdownMenuShortcut>
              <ImageIcon size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}

        {canVerify && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(order)
                setOpen('verify')
              }}
              className='text-green-600 focus:text-green-600 dark:text-green-400'
            >
              Verify Payment
              <DropdownMenuShortcut>
                <CheckCircle size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
