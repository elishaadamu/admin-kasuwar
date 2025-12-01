// @ts-nocheck
'use client'

import { useState } from 'react'
import { z } from 'zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { API_CONFIG, apiUrl } from '@/config/api'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type User as Order } from '../data/schema'
import { useUsers } from './users-provider'

// @ts-nocheck

export const shippingMethods = ['intra state', 'inter state']

const formSchema = z.object({
  shippingMethod: z.string().min(1, 'Shipping method is required.'),
})

type ShippingForm = z.infer<typeof formSchema>

type UsersShippingDialogProps = {
  currentRow?: Order
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersShippingDialog({
  currentRow,
  open,
  onOpenChange,
}: UsersShippingDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { updateUser } = useUsers()

  const form = useForm<ShippingForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shippingMethod: currentRow?.shippingMethod || '',
    },
  })

  const onSubmit = async (values: ShippingForm) => {
    setIsLoading(true)
    try {
      const response = await axios.put(
        `${apiUrl(API_CONFIG.ENDPOINTS.SHIPPING_METHOD.UPDATE)}${user?.id}/${currentRow?._id}`,
        values
      )
      updateUser(currentRow!._id, response.data.order)
      toast.success('Order shipping method updated successfully!')
      onOpenChange(false)
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to update shipping method.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Update Shipping Method</DialogTitle>
          <DialogDescription>
            Select a new shipping method for the order.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id='shipping-form' onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='shippingMethod'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shipping Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a shipping method' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {shippingMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          <span className='capitalize'>{method}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button
            type='submit'
            form='shipping-form'
            disabled={isLoading}
            className='w-full'
          >
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Update Shipping
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
