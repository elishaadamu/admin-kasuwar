// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { API_CONFIG, apiUrl } from '@/config/api'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DeliveryRequest } from '../types'

// @ts-nocheck

// @ts-nocheck

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
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>Delivery Request Details</DialogTitle>
          <DialogDescription>
            Viewing details for &quot;{currentRow.senderName}&quot;.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className='flex items-center justify-center p-8'>
            <Loader2 className='mr-2 h-8 w-8 animate-spin' />
            <span>Loading details...</span>
          </div> // Display details using deliveryRequestDetails
        ) : deliveryRequestDetails ? (
          <div className='grid grid-cols-3 gap-x-4 gap-y-3 rounded-md border p-4'>
            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Request ID
            </div>
            <div className='col-span-2 text-sm'>
              {deliveryRequestDetails._id}
            </div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Sender Name
            </div>
            <div className='col-span-2 text-sm'>
              {deliveryRequestDetails.senderName}
            </div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Sender Phone
            </div>
            <div className='col-span-2 text-sm'>
              {deliveryRequestDetails.senderPhone}
            </div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Sender Address
            </div>
            <div className='col-span-2 text-sm'>
              {deliveryRequestDetails.senderAddress}
            </div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Sender State
            </div>
            <div className='col-span-2 text-sm'>
              {deliveryRequestDetails.senderState}
            </div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Sender LGA
            </div>
            <div className='col-span-2 text-sm'>
              {deliveryRequestDetails.senderLGA}
            </div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Recipient Name
            </div>
            <div className='col-span-2 text-sm'>
              {deliveryRequestDetails.receipientName}
            </div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Recipient Phone
            </div>
            <div className='col-span-2 text-sm'>
              {deliveryRequestDetails.receipientPhone}
            </div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Recipient Alt. Phone
            </div>
            <div className='col-span-2 text-sm'>
              {deliveryRequestDetails.receipientAltPhone || 'N/A'}
            </div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Recipient Address
            </div>
            <div className='col-span-2 text-sm'>
              {deliveryRequestDetails.receipientAddress}
            </div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Recipient State
            </div>
            <div className='col-span-2 text-sm'>
              {deliveryRequestDetails.receipientState}
            </div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Recipient LGA
            </div>
            <div className='col-span-2 text-sm'>
              {deliveryRequestDetails.receipientLGA}
            </div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Description
            </div>
            <div className='col-span-2 text-sm'>
              {deliveryRequestDetails.description}
            </div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Request Type
            </div>
            <div className='col-span-2 text-sm'>
              {deliveryRequestDetails.requestType}
            </div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Delivery Duration
            </div>
            <div className='col-span-2 text-sm'>
              {deliveryRequestDetails.deliveryDuration}
            </div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Payment Status
            </div>
            <div className='col-span-2 text-sm'>
              <Badge
                variant={
                  deliveryRequestDetails.isPaid ? 'default' : 'destructive'
                }
              >
                {deliveryRequestDetails.isPaid ? 'Paid' : 'Unpaid'}
              </Badge>
            </div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Request Status
            </div>
            <div className='col-span-2 text-sm'>
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

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Created At
            </div>
            <div className='col-span-2 text-sm'>
              {formatDate(deliveryRequestDetails.createdAt)}
            </div>
          </div>
        ) : (
          <div className='text-center'>No details found.</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
