'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Mail,
  Phone,
  Wallet,
  ShieldCheck,
  CreditCard,
} from 'lucide-react'
import { type FundDebitUser } from '../types'

type UsersViewDialogProps = {
  currentRow?: FundDebitUser
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersViewDialog({
  currentRow,
  open,
  onOpenChange,
}: UsersViewDialogProps) {
  if (!currentRow) return null

  const userName = currentRow.name || 
    `${currentRow.firstName || ''} ${currentRow.lastName || ''}`.trim() || 
    'N/A'

  const status = currentRow.status || (currentRow.suspended ? 'suspended' : 'active')
  
  const getStatusVariant = () => {
    switch (status) {
      case 'active': return 'default'
      case 'suspended': return 'destructive'
      case 'pending': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-2xl'>
        <DialogHeader className='text-start'>
          <DialogTitle className='flex items-center gap-2'>
            <CreditCard className='h-5 w-5 text-primary' />
            User Details
          </DialogTitle>
          <DialogDescription>
            Viewing detailed information for {userName}.
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-6 py-4'>
          {/* Header / Summary Info Box */}
          <div className='flex flex-wrap items-center justify-between gap-4 rounded-xl bg-muted/30 p-5 border border-muted/50'>
            <div className='space-y-1.5'>
              <div className='flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                <User className='h-3 w-3' />
                User ID
              </div>
              <p className='text-sm font-mono font-bold text-primary'>{currentRow._id}</p>
            </div>
            <div className='flex gap-4'>
              <div className='space-y-1.5'>
                <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right'>Status</p>
                <div className='flex justify-end'>
                  <Badge variant={getStatusVariant()} className='capitalize'>
                    {status}
                  </Badge>
                </div>
              </div>
              <div className='space-y-1.5'>
                <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right'>Role</p>
                <div className='flex justify-end'>
                  <Badge variant='outline' className='capitalize'>
                    {currentRow.role?.replace('-', ' ') || 'User'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* User Information Box */}
            <div className='rounded-2xl border bg-card p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow'>
              <div className='flex items-center gap-2 pb-3 border-b'>
                <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'>
                  <User className='h-5 w-5' />
                </div>
                <div>
                  <h3 className='font-bold'>User Details</h3>
                  <p className='text-[10px] font-medium text-muted-foreground uppercase'>Personal Info</p>
                </div>
              </div>

              <div className='space-y-3 pt-1'>
                <div className='flex flex-col gap-0.5'>
                  <span className='text-[10px] font-bold uppercase text-muted-foreground'>Name</span>
                  <span className='text-sm font-semibold'>{userName}</span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <Mail className='h-3.5 w-3.5 text-muted-foreground' />
                  <span className='font-medium'>{currentRow.email || 'N/A'}</span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <Phone className='h-3.5 w-3.5 text-muted-foreground' />
                  <span className='font-medium'>{currentRow.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Wallet Information Box */}
            <div className='rounded-2xl border bg-card p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow'>
              <div className='flex items-center gap-2 pb-3 border-b'>
                <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'>
                  <Wallet className='h-5 w-5' />
                </div>
                <div>
                  <h3 className='font-bold'>Wallet</h3>
                  <p className='text-[10px] font-medium text-muted-foreground uppercase'>Balance Info</p>
                </div>
              </div>

              <div className='space-y-3 pt-1'>
                <div className='flex flex-col gap-0.5'>
                  <span className='text-[10px] font-bold uppercase text-muted-foreground'>Current Balance</span>
                  <span className='text-lg font-bold text-green-600'>
                    ₦{(currentRow.walletBalance || 0).toLocaleString()}
                  </span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <ShieldCheck className='h-3.5 w-3.5 text-muted-foreground' />
                  <div className='flex flex-col'>
                    <span className='text-[10px] font-bold text-muted-foreground uppercase'>Virtual Account</span>
                    <span className='font-medium'>
                      {currentRow.virtualAcc ? 'Enabled' : 'Not Enabled'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Info */}
          {currentRow.createdAt && (
            <div className='rounded-2xl border bg-card p-6 space-y-5 shadow-sm'>
              <div className='flex items-center gap-2 pb-3 border-b'>
                <h3 className='font-bold'>Account Information</h3>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                <div className='space-y-1.5'>
                  <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>Created At</p>
                  <p className='text-sm font-bold text-foreground'>
                    {new Date(currentRow.createdAt).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                {currentRow.updatedAt && (
                  <div className='space-y-1.5'>
                    <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>Last Updated</p>
                    <p className='text-sm font-bold text-foreground'>
                      {new Date(currentRow.updatedAt).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
