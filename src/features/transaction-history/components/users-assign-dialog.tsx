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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUsers } from './users-provider'

// @ts-nocheck

const formSchema = z.object({
  deliveryManId: z.string().min(1, 'Select a delivery man'),
  price: z.coerce.number().min(0, 'Price must be >= 0'),
})

type AssignForm = z.infer<typeof formSchema>

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersAssignDialog({ open, onOpenChange }: Props) {
  const { currentRow, deliveryMen, assignDeliveryTask } = useUsers()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<AssignForm>({
    // zodResolver generic shapes can cause a TS mismatch in some projects; cast to any to be safe
    resolver: zodResolver(formSchema) as any,
    defaultValues: { deliveryManId: '', price: undefined as any },
  })

  useEffect(() => {
    if (open && currentRow) {
      form.reset({ deliveryManId: '', price: undefined as any })
    }
  }, [open, currentRow])

  const onSubmit = async (values: AssignForm) => {
    if (!currentRow || !assignDeliveryTask) return
    setIsLoading(true)
    try {
      await assignDeliveryTask(
        currentRow._id,
        values.deliveryManId,
        values.price
      )

      onOpenChange(false)
    } catch (err) {
      console.error('Assign error', err)
      toast.error('Failed to assign delivery task')
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
          <DialogTitle>Assign Delivery Task</DialogTitle>
          <DialogDescription>
            Assign a delivery man and price for{' '}
            <span className='font-bold'>{currentRow?.senderName}</span>
          </DialogDescription>
          <DialogDescription className='font-bold'>
            Sender Address: {currentRow?.senderAddress}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='assign-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='deliveryManId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Men</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select delivery man' />
                    </SelectTrigger>
                    <SelectContent>
                      {(deliveryMen || []).map((dm) => (
                        <SelectItem key={dm._id} value={dm._id}>
                          {dm.name} -{' '}
                          <span className='font-bold'> {dm.serviceAreas}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
          <Button type='submit' form='assign-form' disabled={isLoading}>
            {isLoading ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : null}
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
