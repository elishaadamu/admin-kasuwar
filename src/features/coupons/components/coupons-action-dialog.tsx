// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
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
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { type Coupon } from './users-columns'
// Assuming Coupon type will be defined here
import { useUsers } from './users-provider'

// @ts-nocheck

const formSchema = z.object({
  discountAmount: z.coerce
    .number({
      required_error: 'Discount amount is required.',
      invalid_type_error: 'Discount amount must be a number.',
    })
    .min(0, 'Discount amount must be a positive number.'),
  minimumOrderAmount: z.coerce
    .number({
      required_error: 'Minimum order amount is required.',
      invalid_type_error: 'Minimum order amount must be a number.',
    })
    .min(0, 'Minimum order amount must be a positive number.'),
  validFrom: z.string().min(1, 'Valid from date is required.'),
  validUntil: z.string().min(1, 'Valid until date is required.'),
  usageLimit: z.coerce
    .number({
      required_error: 'Usage limit is required.',
      invalid_type_error: 'Usage limit must be a number.',
    })
    .int()
    .min(1, 'Usage limit must be at least 1.'),
  isActive: z.boolean().default(true),
})

type FormValues = z.infer<typeof formSchema>

type ActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Coupon | null
}

export function CouponsActionDialog({
  open,
  onOpenChange,
  currentRow,
}: ActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { addUser: addCoupon, updateUser: updateCoupon } = useUsers()
  const isEdit = !!currentRow

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          discountAmount: currentRow.discountAmount,
          minimumOrderAmount: currentRow.minimumOrderAmount,
          validFrom: new Date(currentRow.validFrom).toISOString().split('T')[0],
          validUntil: new Date(currentRow.validUntil)
            .toISOString()
            .split('T')[0],
          usageLimit: currentRow.usageLimit,
          isActive: currentRow.isActive,
        }
      : {
          discountAmount: 0,
          minimumOrderAmount: 0,
          validFrom: '',
          validUntil: '',
          usageLimit: 1,
          isActive: true,
        },
  })

  async function onSubmit(data: FormValues) {
    setIsLoading(true)
    try {
      if (!user?.id) throw new Error('Admin user ID is not available.')
      console.log('data', data)
      const payload = {
        ...data,
        createdBy: user.id,
      }
      if (isEdit) {
        const response = await axios.put(
          `${apiUrl(API_CONFIG.ENDPOINTS.COUPON.UPDATE)}${currentRow._id}`,
          payload
        )
        updateCoupon(currentRow._id, response.data.coupon)
        toast.success('Coupon updated successfully!')
      } else {
        const response = await axios.post(
          apiUrl(API_CONFIG.ENDPOINTS.COUPON.CREATE),
          payload
        )
        addCoupon(response.data.coupon)
        toast.success('Coupon added successfully!')
      }
      form.reset()
      onOpenChange(false)
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        (isEdit ? 'Failed to update coupon.' : 'Failed to add coupon.')
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex h-full flex-col sm:max-h-[90vh] sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Update Coupon' : 'Add Coupon'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the coupon details.'
              : 'Add a new coupon for customers.'}
          </DialogDescription>
        </DialogHeader>
        <div className='flex-grow overflow-y-auto pr-6'>
          <Form {...form}>
            <form
              id='action-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4'
            >
              <FormField
                control={form.control}
                name='discountAmount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Amount</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='Enter discount amount'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='minimumOrderAmount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Order Amount</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='Enter minimum order amount'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='validFrom'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid From</FormLabel>
                    <FormControl>
                      <Input type='date' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='validUntil'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid Until</FormLabel>
                    <FormControl>
                      <Input type='date' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='usageLimit'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usage Limit</FormLabel>
                    <FormControl>
                      <Input type='number' placeholder='e.g., 100' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='isActive'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
                    <div className='space-y-0.5'>
                      <FormLabel>Active</FormLabel>
                      <DialogDescription>
                        Inactive coupons cannot be used by customers.
                      </DialogDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter className='flex-shrink-0 pt-4'>
          <Button type='submit' form='action-form' disabled={isLoading}>
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isEdit ? 'Update' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
