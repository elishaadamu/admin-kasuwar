// @ts-nocheck
import { useEffect, useState } from 'react'
import { z } from 'zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { API_CONFIG, apiUrl } from '@/config/api'
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

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  event: z.enum(['vendor_subscription', 'delivery_success', 'product_purchase']),
  regionAmount: z.coerce.number().min(0, 'Amount must be non-negative'),
  teamAmount: z.coerce.number().min(0, 'Amount must be non-negative'),
  enabled: z.boolean().default(true),
})


type RewardConfigForm = z.infer<typeof formSchema>

type RewardConfigDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

import { useUsers } from './users-provider'
import { Switch } from '@/components/ui/switch'

export function RewardConfigDialog({
  open,
  onOpenChange,
}: RewardConfigDialogProps) {
  const { currentRow, addUser, updateUser } = useUsers()
  const isEdit = !!currentRow
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<RewardConfigForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      event: undefined,
      regionAmount: 0,
      teamAmount: 0,
     
    },
  })

  useEffect(() => {
    if (open) {
      if (isEdit) {
        form.reset({
          name: currentRow.name,
          event: currentRow.event,
          regionAmount: currentRow.regionAmount,
          teamAmount: currentRow.teamAmount,
          
        })
      } else {
        form.reset({
          name: '',
          event: undefined,
          regionAmount: 0,
          teamAmount: 0,
       
        })
      }
    }
  }, [open, form, currentRow, isEdit])

  const onSubmit = async (values: RewardConfigForm) => {
    setIsLoading(true)
    try {
      if (isEdit) {
        const response = await axios.put(
          `${apiUrl(API_CONFIG.ENDPOINTS.ADMIN.REWARD_CONFIG)}/${currentRow._id}`,
          values,
          { withCredentials: true }
        )
        updateUser(currentRow._id, response.data)
        toast.success('Reward configuration updated successfully!')
      } else {
        const response = await axios.post(
          apiUrl(API_CONFIG.ENDPOINTS.ADMIN.REWARD_CONFIG),
          values,
          { withCredentials: true }
        )
        addUser(response.data)
        toast.success('Reward configuration created successfully!')
      }
      onOpenChange(false)
    } catch (error: any) {
      console.error(error)
      const errorMessage =
        error.response?.data?.message ||
        'Failed to save reward configuration.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) {
          form.reset()
        }
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit Reward' : 'Configure Reward'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update bonus amounts for this event.' : 'Set bonus amounts for specific events.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='reward-config-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Bonus Name'
                      autoComplete='off'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='event'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select an event' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='vendor_subscription'>
                        Vendor Subscription
                      </SelectItem>
                      <SelectItem value='delivery_success'>
                        Delivery Success
                      </SelectItem>
                      <SelectItem value='product_purchase'>
                        Product Purchase
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='regionAmount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region Amount</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='0.00'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name='teamAmount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Amount</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='0.00'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='reward-config-form' disabled={isLoading}>
            {isLoading ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : null}
            {isLoading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
