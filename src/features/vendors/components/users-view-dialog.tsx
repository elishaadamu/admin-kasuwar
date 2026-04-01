// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { API_CONFIG, apiUrl } from '@/config/api'
import { 
  Loader2, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Shield, 
  Calendar, 
  Clock, 
  Hash,
  ShieldCheck,
  UserCheck,
  UserX
} from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type User } from '../data/schema'

type UsersViewDialogProps = {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersViewDialog({
  currentRow,
  open,
  onOpenChange,
}: UsersViewDialogProps) {
  const [vendorDetails, setVendorDetails] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { user: authUser } = useAuth()

  useEffect(() => {
    if (open && currentRow && authUser) {
      const fetchVendorDetails = async () => {
        setIsLoading(true)
        try {
          const response = await axios.get(
            // Use the newly added endpoint + authUser.id + vendor ID
            `${apiUrl(API_CONFIG.ENDPOINTS.VENDORS.GET_DETAILS)}${authUser.id}/${currentRow._id || currentRow.id}`
          )
          console.log(response.data)
          // Assuming the API returns the vendor object in a specific field or directly
          const detailData = response.data?.vendor || response.data
          setVendorDetails(detailData)
        } catch (error) {
          console.error('Failed to fetch vendor details:', error)
          // Fallback to currentRow if API fails
          setVendorDetails(currentRow)
        } finally {
          setIsLoading(false)
        }
      }
      fetchVendorDetails()
    }
  }, [open, currentRow, authUser])

  if (!currentRow) return null

  const formatDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    } catch (error) {
      return String(dateString)
    }
  }

  // Display data from state if available, otherwise from row
  const data = vendorDetails || currentRow

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-2xl'>
        <DialogHeader className='text-start'>
          <DialogTitle className='flex items-center gap-2'>
            <UserIcon className='h-5 w-5 text-primary' />
            Vendor Profile Details
          </DialogTitle>
          <DialogDescription>
            Comprehensive profile information for {data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim()}.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className='flex flex-col items-center justify-center p-12 space-y-4'>
            <Loader2 className='h-12 w-12 animate-spin text-primary' />
            <p className='text-muted-foreground animate-pulse'>Fetching vendor profile...</p>
          </div>
        ) : (
          <div className='flex flex-col gap-6 py-4'>
            {/* Header / Summary Info */}
            <div className='flex flex-wrap items-center justify-between gap-4 rounded-xl bg-muted/30 p-5 border border-muted/50 transition-all hover:bg-muted/40'>
              <div className='space-y-1.5'>
                <div className='flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                  <Hash className='h-3 w-3' />
                  Vendor ID
                </div>
                <p className='text-sm font-mono font-bold text-primary'>{data._id || data.id}</p>
              </div>
              <div className='flex gap-4'>
                <div className='space-y-1.5'>
                  <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right'>Account Status</p>
                  <div className='flex justify-end'>
                    <Badge
                      variant={data.suspended ? 'destructive' : 'default'}
                      className='flex items-center gap-1'
                    >
                      {data.suspended ? <UserX className='h-3 w-3' /> : <UserCheck className='h-3 w-3' />}
                      {data.suspended ? 'Suspended' : 'Active'}
                    </Badge>
                  </div>
                </div>
                <div className='space-y-1.5'>
                  <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right'>Verification</p>
                  <div className='flex justify-end'>
                    <Badge variant={data.fullyActive ? 'default' : 'outline'} className={data.fullyActive ? 'bg-emerald-500' : 'text-orange-500 border-orange-500'}>
                      {data.fullyActive ? 'Fully Active' : 'Pending Verification'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Personal Information */}
              <div className='group rounded-2xl border border-blue-100 bg-blue-50/30 dark:border-blue-900/40 dark:bg-blue-900/10 p-5 space-y-4 transition-all hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800'>
                <div className='flex items-center gap-2 pb-3 border-b border-blue-100 dark:border-blue-900/30'>
                  <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'>
                    <UserIcon className='h-5 w-5' />
                  </div>
                  <div>
                    <h3 className='font-bold text-blue-900 dark:text-blue-100'>Personal Details</h3>
                    <p className='text-[10px] font-medium text-blue-600/70 dark:text-blue-400/80 uppercase'>Basic Profile</p>
                  </div>
                </div>
                
                <div className='space-y-4'>
                  <div className='flex flex-col gap-1'>
                    <span className='text-[11px] font-bold uppercase text-blue-600/70 dark:text-blue-400/70'>Vendor Name</span>
                    <span className='text-sm font-semibold text-foreground tracking-tight'>
                      {data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim()}
                    </span>
                  </div>
                  <div className='flex flex-col gap-1'>
                    <span className='text-[11px] font-bold uppercase text-blue-600/70 dark:text-blue-400/70'>Business Type</span>
                    <span className='text-sm font-medium text-foreground bg-blue-100/50 dark:bg-blue-900/30 px-2 py-0.5 rounded w-fit capitalize'>
                      {data.businessType || 'Starter'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className='group rounded-2xl border border-emerald-100 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-900/10 p-5 space-y-4 transition-all hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800'>
                <div className='flex items-center gap-2 pb-3 border-b border-emerald-100 dark:border-emerald-900/30'>
                  <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'>
                    <Mail className='h-5 w-5' />
                  </div>
                  <div>
                    <h3 className='font-bold text-emerald-900 dark:text-emerald-100'>Contact Info</h3>
                    <p className='text-[10px] font-medium text-emerald-600/70 dark:text-emerald-400/80 uppercase'>Communication</p>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div className='flex flex-col gap-1'>
                    <span className='text-[11px] font-bold uppercase text-emerald-600/70 dark:text-emerald-400/70'>Email Address</span>
                    <span className='text-sm font-medium flex items-center gap-2 text-foreground'>
                      <Mail className='h-3.5 w-3.5 text-emerald-500' />
                      {data.email}
                    </span>
                  </div>
                  <div className='flex flex-col gap-1'>
                    <span className='text-[11px] font-bold uppercase text-emerald-600/70 dark:text-emerald-400/70'>Phone Number</span>
                    <span className='text-sm font-medium flex items-center gap-2 text-foreground'>
                      <Phone className='h-3.5 w-3.5 text-emerald-500' />
                      {data.phone || data.phoneNumber}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Timeline */}
            <div className='rounded-2xl border bg-card p-6 space-y-5 shadow-sm'>
              <div className='flex items-center gap-2 pb-3 border-b'>
                 <div className='p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600'>
                   <Clock className='h-5 w-5' />
                 </div>
                 <h3 className='font-bold'>Account Activity</h3>
              </div>
               <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                 <div className='space-y-1.5'>
                    <div className='flex items-center gap-2'>
                       <Calendar className='h-4 w-4 text-primary' />
                       <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>Registration Date</p>
                    </div>
                    <p className='text-sm font-bold pl-6 text-foreground'>{formatDate(data.createdAt)}</p>
                 </div>
                 <div className='space-y-1.5'>
                    <div className='flex items-center gap-2'>
                       <ShieldCheck className='h-4 w-4 text-primary' />
                       <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>Wallet Balance</p>
                    </div>
                    <p className='text-sm font-bold pl-6 text-foreground'>₦{(data.walletBalance || 0).toLocaleString()}</p>
                 </div>

                 <div className='col-span-1 sm:col-span-2'>
                    <Separator className='my-2' />
                    <div className='flex items-center gap-2 mb-2'>
                       <ShieldCheck className='h-4 w-4 text-primary' />
                       <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>Virtual Account Details</p>
                    </div>
                    {data.virtualAccount ? (
                      <div className='grid grid-cols-2 gap-4 pl-6'>
                         <div>
                            <p className='text-[10px] text-muted-foreground uppercase'>Bank Name</p>
                            <p className='text-sm font-bold'>{data.virtualAccount.bankName || 'N/A'}</p>
                         </div>
                         <div>
                            <p className='text-[10px] text-muted-foreground uppercase'>Account Number</p>
                            <p className='text-sm font-bold'>{data.virtualAccount.accountNumber || 'N/A'}</p>
                         </div>
                      </div>
                    ) : (
                      <p className='text-xs font-medium pl-6 text-muted-foreground italic'>Virtual account not yet assigned</p>
                    )}
                 </div>
                 
                 <div className='col-span-1 sm:col-span-2'>
                    <Separator className='mb-4' />
                    <div className='flex items-center justify-between p-3 rounded-lg bg-secondary/20'>
                       <div className='flex items-center gap-3'>
                          <Shield className='h-5 w-5 text-primary' />
                          <div>
                             <p className='text-sm font-bold'>Security Verification</p>
                             <p className='text-xs text-muted-foreground'>
                               {data.fullyActive ? 'Account is fully verified and active.' : 'Account verification is still pending.'}
                             </p>
                          </div>
                       </div>
                       <Badge className={data.fullyActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'}>
                         {data.fullyActive ? 'Verified' : 'Pending'}
                       </Badge>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
