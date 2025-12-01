import axios from 'axios'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { API_CONFIG, apiUrl } from '@/config/api'
import { UserCheck, UserX } from 'lucide-react'
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
  const { updateUser } = useUsers()

  if (!authUser) {
    return null
  }

  const handleStatusChange = async (status: 'active' | 'suspended') => {
    const isSuspending = status === 'suspended'
    const endpoint = API_CONFIG.ENDPOINTS.USER.SUSPEND_BD
    const payload = { bdId: (user as any)._id ?? (user as any).id }

    const userId = (user as any)._id ?? (user as any).id
    const prevSuspended = !!(user as any).suspended
    // apply optimistic change
    updateUser(userId, { suspended: isSuspending })

    // perform API call; revert on failure
    try {
      await toast.promise(
        axios
          .put(`${apiUrl(endpoint)}/${authUser._id}`, payload)
          .then((response) => {
            return response
          }),
        {
          loading: `Updating status to ${status}...`,
          success: `Business Developer has been ${
            isSuspending ? 'suspended' : 'unsuspended'
          }.`,
          error: `Failed to update status.`,
        }
      )
    } catch (err) {
      // revert optimistic update on error
      updateUser(userId, { suspended: prevSuspended })
    }
  }

  const isSuspended = (user as any).suspended === true

  return (
    <>
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
            onClick={() =>
              handleStatusChange(isSuspended ? 'active' : 'suspended')
            }
          >
            {isSuspended ? 'Unsuspend' : 'Suspend'}
            <DropdownMenuShortcut>
              {isSuspended ? <UserCheck size={16} /> : <UserX size={16} />}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
