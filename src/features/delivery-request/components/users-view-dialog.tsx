'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { API_CONFIG, apiUrl } from '@/config/api'
import { 
  Loader2, 
  User, 
  Phone, 
  MapPin, 
  ClipboardList, 
  Calendar, 
  Clock, 
  Truck, 
  ShieldCheck,
  CreditCard,
  Hash
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
import { DeliveryRequest } from '../types'

// Import DeliveryRequest type

type UsersViewDialogProps = {
  currentRow?: DeliveryRequest
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersViewDialog({
  currentRow,
  open,
  onOpenChange,
}: UsersViewDialogProps) {
  // Changed currentRow type to DeliveryRequest
  const [deliveryRequestDetails, setDeliveryRequestDetails] =
    useState<DeliveryRequest | null>(null) // Changed state type and name
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (open && currentRow) {
      const fetchDeliveryMan = async () => {
        setIsLoading(true)
        try {
          // Changed API endpoint to fetch a single delivery request
          const response = await axios.get(
            apiUrl(API_CONFIG.ENDPOINTS.DELIVERY_REQUESTS.GET_ALL)
          )

          // Get the requests array from the response
          const requests = response.data?.requests || []

          // Find the matching request using the currentRow._id
          const matchingRequest = requests.find(
            (request: DeliveryRequest) => request._id === currentRow._id
          )

          setDeliveryRequestDetails(matchingRequest || null)
        } catch (error) {
          console.error('Failed to fetch delivery man details:', error)
        } finally {
          setIsLoading(false)
        }
      }
      fetchDeliveryMan()
    }
  }, [open, currentRow, user?.id])

  if (!currentRow) return null

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return dateString // Return original string if formatting fails
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-2xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>Delivery Request Details</DialogTitle>
          <DialogDescription>
            Viewing details for &quot;{currentRow.senderName}&quot;.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className='flex flex-col items-center justify-center p-12 space-y-4'>
            <Loader2 className='h-12 w-12 animate-spin text-primary' />
            <p className='text-muted-foreground animate-pulse'>Fetching details...</p>
          </div>
        ) : deliveryRequestDetails ? (
          <div className='flex flex-col gap-6 py-4'>
            {/* Header / Summary Info */}
            <div className='flex flex-wrap items-center justify-between gap-4 rounded-xl bg-muted/30 p-5 border border-muted/50 transition-all hover:bg-muted/40'>
              <div className='space-y-1.5'>
                <div className='flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                  <Hash className='h-3 w-3' />
                  Request ID
                </div>
                <p className='text-sm font-mono font-bold text-primary'>{deliveryRequestDetails._id}</p>
              </div>
              <div className='flex gap-4'>
                <div className='space-y-1.5'>
                  <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right'>Payment Status</p>
                  <div className='flex justify-end'>
                    <Badge
                      variant={deliveryRequestDetails.isPaid ? 'default' : 'destructive'}
                      className='flex items-center gap-1'
                    >
                      {deliveryRequestDetails.isPaid ? (
                        <ShieldCheck className='h-3 w-3' />
                      ) : (
                        <CreditCard className='h-3 w-3' />
                      )}
                      {deliveryRequestDetails.isPaid ? 'Paid' : 'Unpaid'}
                    </Badge>
                  </div>
                </div>
                <div className='space-y-1.5'>
                  <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right'>Status</p>
                  <div className='flex justify-end'>
                    <Badge
                      variant={
                        deliveryRequestDetails.status === 'pending'
                          ? 'secondary'
                          : deliveryRequestDetails.status === 'cancelled'
                            ? 'destructive'
                            : 'default'
                      }
                      className='capitalize'
                    >
                      {deliveryRequestDetails.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Sender Details Block */}
              <div className='group rounded-2xl border border-blue-100 bg-blue-50/30 dark:border-blue-900/40 dark:bg-blue-900/10 p-5 space-y-4 transition-all hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800'>
                <div className='flex items-center justify-between pb-3 border-b border-blue-100 dark:border-blue-900/30'>
                  <div className='flex items-center gap-2'>
                    <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'>
                      <User className='h-5 w-5' />
                    </div>
                    <div>
                      <h3 className='font-bold text-blue-900 dark:text-blue-100'>Sender</h3>
                      <p className='text-[10px] font-medium text-blue-600/70 dark:text-blue-400/80 uppercase'>Pickup Point</p>
                    </div>
                  </div>
                </div>
                
                <div className='space-y-3.5'>
                  <div className='flex flex-col gap-1'>
                    <span className='text-[11px] font-bold uppercase text-blue-600/70 dark:text-blue-400/70'>Full Name</span>
                    <span className='text-sm font-semibold text-foreground tracking-tight'>{deliveryRequestDetails.senderName}</span>
                  </div>
                  <div className='flex flex-col gap-1'>
                    <span className='text-[11px] font-bold uppercase text-blue-600/70 dark:text-blue-400/70'>Phone Number</span>
                    <span className='text-sm font-medium flex items-center gap-2 text-foreground'>
                      <Phone className='h-3.5 w-3.5 text-blue-500' />
                      {deliveryRequestDetails.senderPhone}
                    </span>
                  </div>
                  <div className='flex flex-col gap-1'>
                    <span className='text-[11px] font-bold uppercase text-blue-600/70 dark:text-blue-400/70'>Location</span>
                    <span className='text-sm font-medium flex items-start gap-2 text-foreground leading-relaxed'>
                      <MapPin className='h-3.5 w-3.5 mt-0.5 text-blue-500 shrink-0' />
                      {deliveryRequestDetails.senderAddress}, {deliveryRequestDetails.senderLGA}, {deliveryRequestDetails.senderState}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recipient Details Block */}
              <div className='group rounded-2xl border border-emerald-100 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-900/10 p-5 space-y-4 transition-all hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800'>
                <div className='flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-900/30'>
                  <div className='flex items-center gap-2'>
                    <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'>
                      <Truck className='h-5 w-5' />
                    </div>
                    <div>
                      <h3 className='font-bold text-emerald-900 dark:text-emerald-100'>Recipient</h3>
                      <p className='text-[10px] font-medium text-emerald-600/70 dark:text-emerald-400/80 uppercase'>Drop-off Point</p>
                    </div>
                  </div>
                </div>

                <div className='space-y-3.5'>
                  <div className='flex flex-col gap-1'>
                    <span className='text-[11px] font-bold uppercase text-emerald-600/70 dark:text-emerald-400/70'>Full Name</span>
                    <span className='text-sm font-semibold text-foreground tracking-tight'>{deliveryRequestDetails.receipientName}</span>
                  </div>
                  <div className='flex flex-col gap-1'>
                    <span className='text-[11px] font-bold uppercase text-emerald-600/70 dark:text-emerald-400/70'>Phone Number</span>
                    <div className='flex flex-col gap-1.5'>
                      <span className='text-sm font-medium flex items-center gap-2 text-foreground'>
                        <Phone className='h-3.5 w-3.5 text-emerald-500' />
                        {deliveryRequestDetails.receipientPhone}
                      </span>
                      {deliveryRequestDetails.receipientAltPhone && (
                        <span className='text-xs font-medium text-muted-foreground pl-5 italic'>
                          Alt: {deliveryRequestDetails.receipientAltPhone}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className='flex flex-col gap-1'>
                    <span className='text-[11px] font-bold uppercase text-emerald-600/70 dark:text-emerald-400/70'>Location</span>
                    <span className='text-sm font-medium flex items-start gap-2 text-foreground leading-relaxed'>
                      <MapPin className='h-3.5 w-3.5 mt-0.5 text-emerald-500 shrink-0' />
                      {deliveryRequestDetails.receipientAddress}, {deliveryRequestDetails.receipientLGA}, {deliveryRequestDetails.receipientState}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Specifications Section */}
            <div className='rounded-2xl border bg-card p-6 space-y-5 shadow-sm'>
              <div className='flex items-center gap-2 pb-3 border-b'>
                 <div className='p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600'>
                   <ClipboardList className='h-5 w-5' />
                 </div>
                 <h3 className='font-bold'>Delivery Specifications</h3>
              </div>
              <div className='grid grid-cols-2 gap-6'>
                 <div className='space-y-1.5'>
                    <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>Request Type</p>
                    <div className='flex items-center gap-2'>
                      <Clock className='h-4 w-4 text-primary' />
                      <p className='text-sm font-bold capitalize'>{deliveryRequestDetails.requestType}</p>
                    </div>
                 </div>
                 <div className='space-y-1.5'>
                    <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>Duration</p>
                    <p className='text-sm font-bold'>{deliveryRequestDetails.deliveryDuration}</p>
                 </div>
                 <div className='space-y-1.5 col-span-2'>
                    <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>Description</p>
                    <div className='rounded-lg bg-secondary/30 p-3 italic text-sm text-foreground/80 leading-relaxed'>
                      &ldquo;{deliveryRequestDetails.description}&rdquo;
                    </div>
                 </div>
                 <div className='space-y-2 col-span-2 pt-4'>
                    <Separator className='mb-4' />
                    <div className='flex items-center justify-between'>
                      <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>Placement Date</p>
                      <p className='text-sm font-semibold text-primary flex items-center gap-2'>
                        <Calendar className='h-4 w-4' />
                        {formatDate(deliveryRequestDetails.createdAt)}
                      </p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        ) : (
          <div className='text-center py-12 text-muted-foreground'>
            <p>No details found for this request.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
