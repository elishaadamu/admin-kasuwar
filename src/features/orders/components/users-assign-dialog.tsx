// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
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

interface DeliveryMan {
  _id: string
  name: string
  serviceAreas: string[]
}

const formSchema = z.object({
  deliveryManId: z.string().min(1, 'Delivery person is required.'),
})

type AssignForm = z.infer<typeof formSchema>

type UsersAssignDialogProps = {
  currentRow?: Order
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersAssignDialog({
  currentRow,
  open,
  onOpenChange,
}: UsersAssignDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [deliveryMen, setDeliveryMen] = useState<DeliveryMan[]>([])
  const { user } = useAuth()
  const { updateUser } = useUsers()

  useEffect(() => {
    if (open) {
      axios
        .get(
          apiUrl(API_CONFIG.ENDPOINTS.DELIVERY_MANAGEMENT.GET_ALL + user?.id)
        )
        .then((res) => {
          console.log(res.data.deliveryMen)
          setDeliveryMen(res.data.deliveryMen || [])
        })
        .catch(() => {
          toast.error('Failed to fetch delivery personnel.')
        })
    }
  }, [open])

  const form = useForm<AssignForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deliveryManId: currentRow?.deliveryMan?._id || '',
    },
  })

  const onSubmit = async (values: AssignForm) => {
    console.log('Payload:', values)
    setIsLoading(true)
    try {
      const response = await axios.put(
        `${apiUrl(API_CONFIG.ENDPOINTS.DELIVERY_MANAGEMENT.ASSIGN)}${user?.id}/${currentRow?._id}`,
        values
      )
      // Optimistically update the order with the new delivery info if the API returns it
      if (response.data.order) {
        updateUser(currentRow!._id, response.data.order)
      }

      toast.success('Delivery person assigned successfully!')
      onOpenChange(false)
      form.reset()
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to assign delivery person.'
      console.error(error)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle>Assign Delivery Person</DialogTitle>
          <DialogDescription>
            Select a delivery person for this order.
          </DialogDescription>
        </DialogHeader>
        <div>
          <h4 className='text-muted-foreground mb-2 text-sm font-semibold'>
            Products
          </h4>
          {(currentRow?.products || []).map((product) => (
            <div
              key={product._id}
              className='mb-2 grid grid-cols-3 gap-x-4 gap-y-1 rounded-md border p-2 text-sm'
            >
              <div className='col-span-2 font-medium'>{product.name}</div>
              <div className='justify-self-end'>x{product.quantity}</div>
              <div className='text-muted-foreground col-span-3'>
                ID: {product.productId}
              </div>
            </div>
          ))}
        </div>

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
                      {deliveryMen.map((dm) => (
                        <SelectItem key={dm._id} value={dm._id}>
                          {dm.name} -{' '}
                          <span className='font-bold'>
                            {' '}
                            {dm.serviceAreas.join(', ')}
                          </span>
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
          <Button type='submit' form='assign-form' disabled={isLoading}>
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
