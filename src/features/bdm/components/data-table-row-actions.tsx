// @ts-nocheck
import { useState } from 'react'
import axios from 'axios'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { API_CONFIG, apiUrl } from '@/config/api'
import { UserCheck, UserX, Trash2, BanknoteIcon, Send } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type User, type UserStatus } from '../data/schema'
import { DebitDialog } from './debit-dialog'
import { SendReportDialog } from './send-report-dialog'
import { TransferDialog } from './transfer-dialog'
import { useUsers } from './users-provider'

type DataTableRowActionsProps = {
  row: Row<User>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { user: authUser } = useAuth()
  const user = row.original
  const { updateUser, setOpen, setCurrentRow } = useUsers()
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [showDebitDialog, setShowDebitDialog] = useState(false)
  const [showSendReportDialog, setShowSendReportDialog] = useState(false)

  if (!authUser) {
    return null
  }

  const handleStatusChange = async (status: UserStatus) => {
    const isSuspending = status === 'suspended'
    const endpoint = isSuspending
      ? API_CONFIG.ENDPOINTS.MANAGERS.SUSPEND
      : API_CONFIG.ENDPOINTS.MANAGERS.UNSUSPEND

    const prevStatus = user.status
    // Optimistic update
    updateUser(user.id, { status })

    try {
      await toast.promise(
        axios.put(`${apiUrl(endpoint)}${authUser.id}/${user.id}`),
        {
          loading: `Updating status to ${status}...`,
          success: `Manager has been ${
            isSuspending ? 'suspended' : 'unsuspended'
          }.`,
          error: `Failed to update status.`,
        }
      )
    } catch (err) {
      // Revert on error
      updateUser(user.id, { status: prevStatus })
    }
  }

  return (
    <div>
      <DropdownMenu>
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
            onClick={() =>
              handleStatusChange(
                user.status === 'suspended' ? 'active' : 'suspended'
              )
            }
          >
            {user.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
            <DropdownMenuShortcut>
              {user.status === 'suspended' ? (
                <UserCheck size={16} />
              ) : (
                <UserX size={16} />
              )}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(user)
              setOpen('delete')
            }}
          >
            Delete
            <DropdownMenuShortcut>
              <Trash2 size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setShowTransferDialog(true)}>
            Transfer Funds
            <DropdownMenuShortcut>
              <BanknoteIcon size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setShowDebitDialog(true)}>
            Debit Funds
            <DropdownMenuShortcut>
              <BanknoteIcon size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setShowSendReportDialog(true)}>
            Send Report
            <DropdownMenuShortcut>
              <Send size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TransferDialog
        managerId={user._id}
        managerName={user.name}
        open={showTransferDialog}
        onOpenChange={setShowTransferDialog}
      />

      <DebitDialog
        managerId={user._id}
        managerName={user.name}
        open={showDebitDialog}
        onOpenChange={setShowDebitDialog}
      />

      <SendReportDialog
        managerId={user._id}
        managerName={user.name}
        open={showSendReportDialog}
        onOpenChange={setShowSendReportDialog}
      />
    </div>
  )
}
