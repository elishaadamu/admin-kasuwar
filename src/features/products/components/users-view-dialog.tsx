// @ts-nocheck
'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type Product } from './users-action-dialog'

// @ts-nocheck

type UsersViewDialogProps = {
  currentRow?: Product
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersViewDialog({
  currentRow,
  open,
  onOpenChange,
}: UsersViewDialogProps) {
  if (!currentRow) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='m-4 h-full sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>View Product</DialogTitle>
          <DialogDescription>
            Viewing details for &quot;{currentRow.name}&quot;.
          </DialogDescription>
        </DialogHeader>
        <div className='h-[100%] w-[calc(100%+0.75rem)] space-y-4 overflow-y-auto py-1 pe-3'>
          <div className='grid grid-cols-3 gap-x-4 gap-y-2 rounded-md border p-4'>
            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Name
            </div>
            <div className='col-span-2 text-sm'>{currentRow.name}</div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Description
            </div>
            <div className='col-span-2 text-sm'>{currentRow.description}</div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Category
            </div>
            <div className='col-span-2 text-sm'>{currentRow.category}</div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Price
            </div>
            <div className='col-span-2 text-sm'>
              {formatCurrency(currentRow.price)}
            </div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              State
            </div>
            <div className='col-span-2 text-sm'>{currentRow.state}</div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Min. Order
            </div>
            <div className='col-span-2 text-sm'>{currentRow.minOrder}</div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Condition
            </div>
            <div className='col-span-2 text-sm'>{currentRow.condition}</div>

            <div className='text-muted-foreground col-span-1 text-sm font-semibold'>
              Stock
            </div>
            <div className='col-span-2 text-sm'>{currentRow.stock}</div>
          </div>

          <div>
            <h4 className='text-muted-foreground mb-2 text-sm font-semibold'>
              Images
            </h4>
            <div className='grid grid-cols-2 gap-4'>
              {currentRow.images && currentRow.images.length > 0 ? (
                currentRow.images.map((image, index) => (
                  <div key={image.public_id || index} className='relative'>
                    <img
                      src={image.url}
                      alt={`Product image ${index + 1}`}
                      className='h-32 w-full rounded-md object-cover'
                    />
                  </div>
                ))
              ) : (
                <p className='text-muted-foreground col-span-2 text-sm'>
                  No images available for this product.
                </p>
              )}
            </div>
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
