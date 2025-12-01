// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { API_CONFIG, apiUrl } from '@/config/api'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type User as Order } from '../data/schema'

// @ts-nocheck

interface OrderProduct {
  _id: string
  name: string
  price: number
  quantity: number
  images: { url: string }[]
  productId: string
}

interface FullOrder extends Order {
  products: OrderProduct[]
  user: {
    firstName: string
    lastName: string
    email: string
  }
}

interface Product {
  _id: string
  name: string
  price: number
  quantity: number
  images: { url: string }[]
}

type UsersViewDialogProps = {
  currentRow?: Order
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersViewDialog({
  currentRow,
  open,
  onOpenChange,
}: UsersViewDialogProps) {
  const [order, setOrder] = useState<FullOrder | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  useEffect(() => {
    if (open && currentRow) {
      const fetchOrderProducts = async () => {
        setIsLoading(true)
        try {
          const response = await axios.get(
            `${apiUrl(API_CONFIG.ENDPOINTS.ORDER.GET_SINGLE)}${user?.id}/${currentRow._id}`
          )
          console.log(response.data)
          setOrder(response.data.order || null)
        } catch (error) {
          console.error('Failed to fetch order products:', error)
        } finally {
          setIsLoading(false)
        }
      }
      fetchOrderProducts()
    }
  }, [open, currentRow])

  if (!currentRow || !order) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='h-[90vh] overflow-y-auto sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>View Product</DialogTitle>
          <DialogDescription>
            Viewing details for order &quot;{order?._id}&quot;.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='grid grid-cols-3 gap-x-4 gap-y-2 rounded-md border p-4'>
            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Order ID
            </div>
            <div className='col-span-2 text-sm'>{order?._id}</div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Customer
            </div>
            <div className='col-span-2 text-sm'>
              {order?.user?.firstName} {order?.user?.lastName}
            </div>
            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Customer Email
            </div>
            <div className='col-span-2 text-sm'>{order?.user?.email}</div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Phone
            </div>
            <div className='col-span-2 text-sm'>{order?.phone}</div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Delivery Address
            </div>
            <div className='col-span-2 text-sm'>{order?.deliveryAddress}</div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              State
            </div>
            <div className='col-span-2 text-sm'>{order?.state}</div>
            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Zipcode
            </div>
            <div className='col-span-2 text-sm'>{order?.zipcode}</div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Created At
            </div>
            <div className='col-span-2 text-sm'>
              {formatDate(order?.createdAt)}
            </div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Total Amount
            </div>
            <div className='col-span-2 text-sm'>
              {formatCurrency(order?.totalAmount || 0)}
            </div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Payment Status
            </div>
            <div className='text-bold col-span-2 w-24 rounded-md bg-green-200 p-1 text-center text-[16px] text-green-900 uppercase'>
              {order?.status}
            </div>
          </div>

          <div>
            <h4 className='text-muted-foreground mb-2 text-sm font-semibold'>
              Products
            </h4>

            {order?.products?.map((product) => (
              <div
                key={product._id}
                className='mb-2 grid grid-cols-3 gap-x-4 gap-y-2 rounded-md border p-4'
              >
                <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
                  Name
                </div>
                <div className='col-span-2 text-sm'>{product.name}</div>
                <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
                  Price
                </div>
                <div className='col-span-2 text-sm'>
                  {formatCurrency(product.price)}
                </div>
                <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
                  Quantity
                </div>
                <div className='col-span-2 text-sm'>{product.quantity}</div>
                <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
                  Product ID
                </div>
                <div className='col-span-2 text-sm'>{product.productId}</div>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
