import { useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { API_CONFIG, apiUrl } from '@/config/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { usePos } from './pos-provider'
import { type PosOrder } from '../data/schema'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: PosOrder
}

export function PosVerifyDialog({ open, onOpenChange, currentRow }: Props) {
  const [isVerifying, setIsVerifying] = useState(false)
  const { updateOrder } = usePos()

  const handleVerify = async () => {
    setIsVerifying(true)
    try {
      await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.POS.VERIFY_PAYMENT),
        { posOrderId: currentRow._id },
        { withCredentials: true }
      )

      updateOrder(currentRow._id, { status: 'confirmed' })
      toast.success('Payment verified successfully. A real order has been created.')
      onOpenChange(false)
    } catch (error: any) {
      console.error('Failed to verify payment', error)
      toast.error(error?.response?.data?.message || 'Failed to verify payment. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const productNames = currentRow?.products
    ?.map((p) => p.name.replace(/&#x27;/g, "'"))
    .join(', ')

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!isVerifying) onOpenChange(val)
    }}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Verify Payment</DialogTitle>
          <DialogDescription>
            Confirm the payment for POS order{' '}
            <span className='font-semibold text-foreground'>
              {currentRow?.uniqueOrderCode}
            </span>
            . This will create a real order in the system.
          </DialogDescription>
        </DialogHeader>

        <div className='divide-y rounded-md border text-sm'>
          <div className='flex justify-between px-4 py-2'>
            <span className='text-muted-foreground'>Order Code</span>
            <span className='font-mono font-semibold'>{currentRow?.uniqueOrderCode}</span>
          </div>
          <div className='flex justify-between px-4 py-2'>
            <span className='text-muted-foreground'>Sales Manager</span>
            <span className='font-medium'>
              {currentRow?.salesManager
                ? `${currentRow.salesManager.firstName} ${currentRow.salesManager.lastName}`
                : 'N/A'}
            </span>
          </div>
          <div className='flex justify-between px-4 py-2'>
            <span className='text-muted-foreground'>Customer</span>
            <span className='font-medium'>{currentRow?.customerName || currentRow?.customerPhone || 'Guest'}</span>
          </div>
          <div className='flex justify-between px-4 py-2'>
            <span className='text-muted-foreground'>Products</span>
            <span className='font-medium text-right max-w-[200px]'>{productNames}</span>
          </div>
          <div className='flex justify-between px-4 py-2'>
            <span className='text-muted-foreground'>Amount</span>
            <span className='font-semibold'>
              {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(
                currentRow?.totalAmount || 0
              )}
            </span>
          </div>
          <div className='flex justify-between px-4 py-2'>
            <span className='text-muted-foreground'>Location</span>
            <span className='font-medium'>
              {[currentRow?.lga, currentRow?.state].filter(Boolean).join(', ')}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isVerifying}
          >
            Cancel
          </Button>
          <Button onClick={handleVerify} disabled={isVerifying}>
            {isVerifying ? 'Verifying...' : 'Confirm Verification'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
