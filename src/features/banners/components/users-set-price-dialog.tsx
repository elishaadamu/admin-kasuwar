// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useUsers } from './users-provider'

// @ts-nocheck

const formSchema = z.object({
  price: z.coerce.number().min(0, 'Price must be >= 0'),
})

type SetPriceForm = z.infer<typeof formSchema>

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersSetPriceDialog({ open, onOpenChange }: Props) {
  const { currentRow, setDeliveryPrice } = useUsers()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<SetPriceForm>({
    resolver: zodResolver(formSchema),
    defaultValues: { price: (currentRow as any)?.price || 0 },
  })

  useEffect(() => {
    if (open && currentRow) {
      form.reset({ price: (currentRow as any)?.price || 0 })
    }
  }, [open, currentRow, form])

  const onSubmit = async (values: SetPriceForm) => {
    if (!currentRow || !setDeliveryPrice) return
    setIsLoading(true)
    try {
      await setDeliveryPrice(currentRow._id, values.price)
      onOpenChange(false)
    } catch (err) {
      console.error('Set price error', err)
      toast.error('Failed to set delivery price')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle>Set Delivery Price</DialogTitle>
          <DialogDescription>
            Set a price for the delivery request from{' '}
            <span className='font-bold'>{currentRow?.senderName}</span>.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='set-price-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='price'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type='number' placeholder='e.g., 1500' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button type='submit' form='set-price-form' disabled={isLoading}>
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Set Price
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
