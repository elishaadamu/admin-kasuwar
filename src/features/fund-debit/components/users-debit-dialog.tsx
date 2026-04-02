'use client'

import * as React from 'react'
import { MinusCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { type FundDebitUser } from '../types'
import { useUsers } from './users-provider'

type UsersDebitDialogProps = {
  currentRow: FundDebitUser
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersDebitDialog({
  currentRow,
  open,
  onOpenChange,
}: UsersDebitDialogProps) {
  const { onDebit } = useUsers()
  const [amount, setAmount] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      return
    }

    setIsSubmitting(true)
    try {
      await onDebit?.(currentRow._id, numAmount, description || undefined)
      setAmount('')
      setDescription('')
      onOpenChange(false)
    } catch (error) {
      console.error('Debit failed', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const userName = currentRow.name || 
    `${currentRow.firstName || ''} ${currentRow.lastName || ''}`.trim() || 
    'User'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <MinusCircle className='h-5 w-5 text-destructive' />
            Debit Wallet
          </DialogTitle>
          <DialogDescription>
            Deduct funds from {userName}'s wallet. This will decrease their wallet balance.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='amount'>Amount (₦)</Label>
              <Input
                id='amount'
                type='number'
                min='0'
                step='0.01'
                placeholder='Enter amount'
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='description'>Description (Optional)</Label>
              <Textarea
                id='description'
                placeholder='Reason for debit...'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            {currentRow.walletBalance !== undefined && (
              <div className='rounded-lg bg-muted p-3'>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Current Balance:</span>
                  <span className='font-semibold text-green-600'>
                    ₦{currentRow.walletBalance.toLocaleString()}
                  </span>
                </div>
                {amount && !isNaN(parseFloat(amount)) && (
                  <div className='mt-2 flex justify-between text-sm border-t pt-2'>
                    <span className='text-muted-foreground'>Balance After:</span>
                    <span className={`font-semibold ${
                      currentRow.walletBalance! - parseFloat(amount) >= 0 
                        ? 'text-green-600' 
                        : 'text-destructive'
                    }`}>
                      ₦{(currentRow.walletBalance! - parseFloat(amount)).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
              variant='destructive'
            >
              {isSubmitting ? 'Processing...' : 'Debit Wallet'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
