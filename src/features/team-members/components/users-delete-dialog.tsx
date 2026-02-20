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
        `${apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.DELETE_TEAM_MEMBER)}${
          currentRow._id || currentRow.id
        }`
      ),
      {
        loading: 'Deleting Member...',
        success: () => {
          removeUser(currentRow._id || currentRow.id)
          onOpenChange(false)
          return 'Member deleted successfully.'
        },
        error: (error: any) => {
        
          return error.response?.data?.message || 'Failed to delete member.'
        },
      }
    )
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      title='Delete Member'
      desc={
        <p>
          Are you sure you want to delete <b>{currentRow.name || currentRow.username}</b>? This action
          cannot be undone.
        </p>
      }
      confirmText='Delete'
      destructive
    />
  )
}
