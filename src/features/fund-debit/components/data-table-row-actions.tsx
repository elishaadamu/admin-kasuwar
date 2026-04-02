import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Wallet, MinusCircle, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type FundDebitUser } from '../types'
import { useUsers } from './users-provider'

type DataTableRowActionsProps = {
  row: Row<FundDebitUser>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const user = row.original
  const { setOpen, setCurrentRow } = useUsers()

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
            setCurrentRow(user)
            setOpen('view')
          }}
        >
          View Details
          <DropdownMenuShortcut>
            <Eye size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(user)
            setOpen('fund')
          }}
        >
          Fund Wallet
          <DropdownMenuShortcut>
            <Wallet size={16} className='text-green-600' />
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(user)
            setOpen('debit')
          }}
        >
          Debit Wallet
          <DropdownMenuShortcut>
            <MinusCircle size={16} className='text-destructive' />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
