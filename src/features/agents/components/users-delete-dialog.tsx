// @ts-nocheck
'use client'

import axios from 'axios'
import { API_CONFIG, apiUrl } from '@/config/api'
import { toast } from 'sonner'
import { useAuth } from '@/context/auth-context'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type User } from '../data/schema'
import { useUsers } from './users-provider'

// @ts-nocheck

type UserDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: UserDeleteDialogProps) {
  const { user } = useAuth()
  const { removeUser } = useUsers()

  const handleDelete = async () => {
    if (!user) return
    toast.promise(
      axios.delete(
        `${apiUrl(API_CONFIG.ENDPOINTS.CUSTOMERS.DELETE)}${user.id}/${
          currentRow._id
        }`
      ),
      {
        loading: 'Deleting Agent...',
        success: () => {
          removeUser(currentRow._id)
          return 'Agent deleted successfully.'
        },
        error: (error) => {
          console.error('Error deleting agent:', error)
          return error.response?.data?.message || 'Failed to delete agent.'
        },
      }
    )
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      title='Delete agent'
      desc={
        <p>
          Are you sure you want to delete <b>{currentRow.firstName}</b>? This
          action cannot be undone.
        </p>
      }
      confirmText='Delete'
      destructive
    />
  )
}
