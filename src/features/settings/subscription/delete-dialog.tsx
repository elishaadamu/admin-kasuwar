'use client'

import axios from 'axios'
import { API_CONFIG, apiUrl } from '@/config/api'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/auth-context'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useSubscriptions } from './provider'
import { type Subscription } from './schema'

type DeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Subscription
}

export function DeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: DeleteDialogProps) {
  const { user } = useAuth()
  const { removeSubscription } = useSubscriptions()

  const handleDelete = async () => {
    try {
      if (!user?.id) throw new Error('Admin user ID is not available.')
      await axios.delete(
        `${apiUrl(API_CONFIG.ENDPOINTS.SUBSCRIPTION.DELETE)}${user.id}/${
          currentRow.id
        }`
      )
      removeSubscription(currentRow.id)
      toast.success('Subscription deleted successfully.')
      onOpenChange(false)
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to delete subscription.'
      toast.error(errorMessage)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />
          Delete Subscription
        </span>
      }
      desc={
        <p>
          Are you sure you want to delete the <b>{currentRow.name}</b>{' '}
          subscription? This action cannot be undone.
        </p>
      }
      confirmText='Delete'
      destructive
    />
  )
}
