'use client'

import axios from 'axios'
import { API_CONFIG, apiUrl } from '@/config/api'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useShippingRegions } from './provider'
import { type ShippingRegion } from './schema'

type DeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: ShippingRegion
}

export function DeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: DeleteDialogProps) {
  const { removeRegion } = useShippingRegions()

  const handleDelete = async () => {
    try {
      await axios.delete(
        `${apiUrl(API_CONFIG.ENDPOINTS.SHIPPING_FEE.DELETE)}/${currentRow.id}`
      )
      removeRegion(currentRow.id)
      toast.success('Shipping region deleted successfully.')
      onOpenChange(false)
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to delete shipping region.'
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
          />{' '}
          Delete Region
        </span>
      }
      desc={
        <p>
          Are you sure you want to delete the <b>{currentRow.region}</b> region?
          This action cannot be undone.
        </p>
      }
      confirmText='Delete'
      destructive
    />
  )
}
