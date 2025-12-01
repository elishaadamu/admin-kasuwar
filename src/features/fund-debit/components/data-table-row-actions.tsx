import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { CheckCircle2, XCircle, Eye, UserPlus, DollarSign } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type DeliveryRequest } from '../types'
import { useUsers } from './users-provider'

type DataTableRowActionsProps = {
  row: Row<DeliveryRequest>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { user: authUser } = useAuth()
  const deliveryRequest = row.original
  const { setOpen, setCurrentRow } = useUsers()

  if (!authUser) {
    return null // Or handle the case where authUser is not available
  }

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
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(deliveryRequest)
            setOpen('view')
          }}
        >
          View Details
          <DropdownMenuShortcut>
            <Eye size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        <>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(deliveryRequest)
              setOpen('approve')
            }}
          >
            Approve Request
            <DropdownMenuShortcut>
              <CheckCircle2 size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(deliveryRequest)
              setOpen('cancel')
            }}
          >
            Cancel Request
            <DropdownMenuShortcut>
              <XCircle size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(deliveryRequest)
              setOpen('assign')
            }}
          >
            Assign Delivery
            <DropdownMenuShortcut>
              <UserPlus size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(deliveryRequest)
              setOpen('set-price')
            }}
          >
            Set Price
            <DropdownMenuShortcut>
              <DollarSign size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
