'use client'

import * as React from 'react'
import { Wallet } from 'lucide-react'
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
import { type FundDebitUser } from '../types'
import { useUsers } from './users-provider'

type UsersFundDialogProps = {
  currentRow: FundDebitUser
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersFundDialog({
  currentRow,
  open,
  onOpenChange,
}: UsersFundDialogProps) {
  const { onFund } = useUsers()
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
      await onFund?.(currentRow._id, numAmount, description)
      setAmount('')
      setDescription('')
      onOpenChange(false)
    } catch (error) {
      console.error('Fund failed', error)
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
            <Wallet className='h-5 w-5 text-green-600' />
            Fund Wallet
          </DialogTitle>
          <DialogDescription>
            Add funds to {userName}'s wallet. This will increase their wallet balance.
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
                required
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='description'>Description</Label>
              <textarea
                id='description'
                placeholder='Enter transfer description...'
                className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
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
              className='bg-green-600 hover:bg-green-700'
            >
              {isSubmitting ? 'Processing...' : 'Fund Wallet'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
