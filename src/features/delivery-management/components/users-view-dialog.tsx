// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { API_CONFIG, apiUrl } from '@/config/api'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type User } from '../data/schema'

// @ts-nocheck

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
  const [deliveryMan, setDeliveryMan] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (open && currentRow) {
      const fetchDeliveryMan = async () => {
        setIsLoading(true)
        try {
          const response = await axios.get(
            `${apiUrl(API_CONFIG.ENDPOINTS.DELIVERY_MANAGEMENT.GET_SINGLE)}${user?.id}/${currentRow._id}`
          )
          setDeliveryMan(response.data.deliveryMan || null)
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>Delivery Man Details</DialogTitle>
          <DialogDescription>
            Viewing details for &quot;{currentRow.name}&quot;.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className='flex items-center justify-center p-8'>
            <Loader2 className='mr-2 h-8 w-8 animate-spin' />
            <span>Loading details...</span>
          </div>
        ) : deliveryMan ? (
          <div className='grid grid-cols-3 gap-x-4 gap-y-3 rounded-md border p-4'>
            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              ID
            </div>
            <div className='col-span-2 text-sm'>{deliveryMan._id}</div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Name
            </div>
            <div className='col-span-2 text-sm'>{deliveryMan.name}</div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Email
            </div>
            <div className='col-span-2 text-sm'>{deliveryMan.email}</div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Phone
            </div>
            <div className='col-span-2 text-sm'>{deliveryMan.phone}</div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Company Name
            </div>
            <div className='col-span-2 text-sm'>
              {deliveryMan.companyName || 'N/A'}
            </div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Address
            </div>
            <div className='col-span-2 text-sm'>{deliveryMan.address}</div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              State
            </div>
            <div className='col-span-2 text-sm'>{deliveryMan.state}</div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Service Areas
            </div>
            <div className='col-span-2 text-sm'>
              {deliveryMan.serviceAreas?.join(', ') || 'N/A'}
            </div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Wallet Balance
            </div>
            <div className='col-span-2 text-sm'>
              {formatCurrency(deliveryMan.walletBalance)}
            </div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Status
            </div>
            <div className='col-span-2 text-sm'>
              <Badge
                variant={deliveryMan.suspended ? 'destructive' : 'default'}
              >
                {deliveryMan.suspended ? 'Suspended' : 'Active'}
              </Badge>
            </div>
          </div>
        ) : (
          <div className='text-center'>No details found.</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
