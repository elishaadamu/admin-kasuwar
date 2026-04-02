// @ts-nocheck
'use client'

import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  Hash, 
  ShieldCheck,
  Building2,
  Banknote,
  CreditCard
} from 'lucide-react'
import { type DeliveryRequest as WithdrawalRequest } from '../types'

type UsersViewDialogProps = {
  currentRow?: WithdrawalRequest
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersViewDialog({
  currentRow,
  open,
  onOpenChange,
}: UsersViewDialogProps) {
  if (!currentRow) return null

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    } catch (error) {
      return dateString
    }
  }

  const userDetails = currentRow.userDetails || currentRow.user || currentRow
 

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-2xl'>
        <DialogHeader className='text-start'>
          <DialogTitle className='flex items-center gap-2'>
            <CreditCard className='h-5 w-5 text-primary' />
            Withdrawal Request Details
          </DialogTitle>
          <DialogDescription>
            Viewing detailed information for withdrawal transaction {currentRow.transactionId || currentRow._id}.
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-6 py-4'>
          {/* Header / Summary Info Box */}
          <div className='flex flex-wrap items-center justify-between gap-4 rounded-xl bg-muted/30 p-5 border border-muted/50'>
            <div className='space-y-1.5'>
              <div className='flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                <Hash className='h-3 w-3' />
                Transaction ID
              </div>
              <p className='text-sm font-mono font-bold text-primary'>{currentRow.transactionId || currentRow._id}</p>
            </div>
            <div className='flex gap-4'>
              <div className='space-y-1.5'>
                <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right'>Status</p>
                <div className='flex justify-end'>
                  <Badge
                    variant={currentRow.status === 'pending' ? 'secondary' : currentRow.status === 'rejected' || currentRow.status === 'cancelled' ? 'destructive' : 'default'}
                    className='capitalize'
                  >
                    {currentRow.status}
                  </Badge>
                </div>
              </div>
              <div className='space-y-1.5'>
                <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right'>Amount</p>
                <div className='flex justify-end'>
                  <p className='text-sm font-bold text-foreground'>₦{parseFloat(currentRow.amount as string).toLocaleString()}</p>
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
                  <p className='text-[10px] font-medium text-muted-foreground uppercase'>Full Profile</p>
                </div>
              </div>
              
              <div className='space-y-3 pt-1'>
                <div className='flex flex-col gap-0.5'>
                  <span className='text-[10px] font-bold uppercase text-muted-foreground'>Name</span>
                  <span className='text-sm font-semibold'>{userDetails?.firstName} {userDetails?.lastName}</span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <Mail className='h-3.5 w-3.5 text-muted-foreground' />
                  <span className='font-medium'>{userDetails?.email || 'N/A'}</span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <Phone className='h-3.5 w-3.5 text-muted-foreground' />
                  <span className='font-medium'>{userDetails?.phone || 'N/A'}</span>
                </div>
                <div className='flex items-center gap-2 pt-1'>
                  <Badge variant='outline' className='text-[10px] uppercase font-bold bg-muted/50'>
                    {currentRow.role || 'User'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Settlement Information Box */}
            <div className='rounded-2xl border bg-card p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow'>
              <div className='flex items-center gap-2 pb-3 border-b'>
                <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400'>
                  <Building2 className='h-5 w-5' />
                </div>
                <div>
                  <h3 className='font-bold'>Settlement</h3>
                  <p className='text-[10px] font-medium text-muted-foreground uppercase'>Banking Info</p>
                </div>
              </div>

              <div className='space-y-3 pt-1'>
                <div className='flex flex-col gap-0.5'>
                  <span className='text-[10px] font-bold uppercase text-muted-foreground'>Bank Name</span>
                  <span className='text-sm font-semibold'>{userDetails?.bankName || 'N/A'}</span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <Banknote className='h-3.5 w-3.5 text-muted-foreground' />
                  <div className='flex flex-col'>
                    <span className='text-[10px] font-bold text-muted-foreground uppercase'>Account Number</span>
                    <span className='font-bold tracking-wider'>{userDetails?.accNumber || 'N/A'}</span>
                  </div>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <ShieldCheck className='h-3.5 w-3.5 text-muted-foreground' />
                  <div className='flex flex-col'>
                    <span className='text-[10px] font-bold text-muted-foreground uppercase'>Account Name</span>
                    <span className='font-medium'>{userDetails?.accName || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline Box */}
          <div className='rounded-2xl border bg-card p-6 space-y-5 shadow-sm'>
            <div className='flex items-center gap-2 pb-3 border-b'>
               <div className='p-2 rounded-lg bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400'>
                 <Clock className='h-5 w-5' />
               </div>
               <h3 className='font-bold'>Request Activity</h3>
            </div>
             <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
               <div className='space-y-1.5'>
                  <div className='flex items-center gap-2'>
                     <Calendar className='h-4 w-4 text-primary' />
                     <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>Date Requested</p>
                  </div>
                  <p className='text-sm font-bold pl-6 text-foreground'>{formatDate(currentRow.createdAt)}</p>
               </div>
               {currentRow.updatedAt && (
                 <div className='space-y-1.5'>
                    <div className='flex items-center gap-2'>
                       <Clock className='h-4 w-4 text-primary' />
                       <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>Last Updated</p>
                    </div>
                    <p className='text-sm font-bold pl-6 text-foreground'>{formatDate(currentRow.updatedAt)}</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
