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

export const statuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']

const formSchema = z.object({
  status: z.string().min(1, 'Status is required.'),
})

type StatusForm = z.infer<typeof formSchema>

type UsersStatusDialogProps = {
  currentRow?: Order
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersStatusDialog({
  currentRow,
  open,
  onOpenChange,
}: UsersStatusDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { updateUser } = useUsers()

  const form = useForm<StatusForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: currentRow?.status || '',
    },
  })

  const onSubmit = async (values: StatusForm) => {
    const payload = { status: values.status }
    setIsLoading(true)
    try {
      const response = await axios.put(
        `${apiUrl(API_CONFIG.ENDPOINTS.ORDER.UPDATE)}${user?.id}/${currentRow?._id}`,
        payload
      )
      updateUser(currentRow!._id, response.data.order)
      toast.success('Order status updated successfully!')
    } catch (error: any) {
      console.log(error)

      toast.error(
        error.response?.data?.message || 'Failed to update order status.'
      )
    } finally {
      setIsLoading(false)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Select a new status for the order.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id='status-form' onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select a status' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          <span className='capitalize'>{status}</span>
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
            form='status-form'
            disabled={isLoading}
            className='w-full'
          >
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
