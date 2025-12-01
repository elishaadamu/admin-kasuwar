// @ts-nocheck
'use client'

import axios from 'axios'
import { API_CONFIG, apiUrl } from '@/config/api'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/auth-context'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
    toast.promise(
      axios.delete(
        `${apiUrl(API_CONFIG.ENDPOINTS.CATEGORY.DELETE)}${user?.id}/${currentRow._id}`
      ),
      {
        loading: 'Deleting category...',
        success: () => {
          removeUser(currentRow._id)
          onOpenChange(false)
          return 'Category deleted successfully.'
        },
        error: 'Failed to delete category.',
      }
    )
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={false}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          Delete Category
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{currentRow.name}</span>?
            <br />
            This action will permanently remove the category from the system.
            This cannot be undone.
          </p>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be careful, this operation can not be rolled back.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='Delete'
      destructive
    />
  )
}
