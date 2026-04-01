import { Eye, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { type Row } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Transaction } from '../data/schema'
import { TransactionDetailsDialog } from './transaction-details-dialog'

type TransactionsRowActionsProps = {
  row: Row<Transaction>
}

export function TransactionsRowActions({ row }: TransactionsRowActionsProps) {
  const transaction = row.original
  const [isViewOpen, setIsViewOpen] = useState(false)



  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          >
            <MoreHorizontal className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <DropdownMenuItem onClick={() => setIsViewOpen(true)}>
            <Eye className='mr-2 h-4 w-4' />
            View Details
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TransactionDetailsDialog
        transactionId={transaction._id}
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
      />
    </>
  )
}
