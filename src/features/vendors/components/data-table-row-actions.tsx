// @ts-nocheck
import axios from 'axios'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { API_CONFIG, apiUrl } from '@/config/api'
import { UserCheck, UserX, Trash2, Eye } from 'lucide-react'
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
import { type User } from '../data/schema'
import { useUsers } from './users-provider'

type DataTableRowActionsProps = {
  row: Row<User>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { user: authUser } = useAuth()
  const user = row.original
  const { updateUser, setOpen, setCurrentRow } = useUsers()

  if (!authUser) {
    return null
  }

  const handleStatusChange = async (status: 'active' | 'suspended') => {
    const isSuspending = status === 'suspended'
    const endpoint = isSuspending
      ? API_CONFIG.ENDPOINTS.VENDORS.SUSPEND
      : API_CONFIG.ENDPOINTS.VENDORS.UNSUSPEND

    const prevSuspended = user.suspended
    // Optimistic update
    updateUser(user._id, { suspended: isSuspending })

    try {
      await toast.promise(
        axios.put(`${apiUrl(endpoint)}${authUser.id}/${user._id}`),
        {
          loading: `Updating status to ${status}...`,
          success: `Vendor has been ${
            isSuspending ? 'suspended' : 'unsuspended'
          }.`,
          error: `Failed to update status.`,
        }
      )
    } catch (err) {
      // Revert on error
      updateUser(user._id, { suspended: prevSuspended })
    }
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
          onClick={() =>
            handleStatusChange(user.suspended ? 'active' : 'suspended')
          }
        >
          {user.suspended ? 'Unsuspend' : 'Suspend'}
          <DropdownMenuShortcut>
            {user.suspended ? <UserCheck size={16} /> : <UserX size={16} />}
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
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
