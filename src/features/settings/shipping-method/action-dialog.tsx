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
import { useShippingRegions } from './provider'
import { type ShippingRegion } from './schema'

// @ts-nocheck

export const regionOptions = [
  'intra-state',
  'inter-state',
  'inter-regional',
] as const

export const deliveryTypeOptions = ['Express', 'Standard'] as const

const formSchema = z.object({
  region: z.string().min(1, 'Region is required.'),
  deliveryType: z.string().min(1, 'Delivery type is required.'),
  duration: z.string().min(1, 'Duration is required.'),
  price: z.coerce
    .number({
      required_error: 'Price is required.',
      invalid_type_error: 'Price must be a number.',
    })
    .min(0, 'Price must be a non-negative number.'),
})

type FormValues = z.output<typeof formSchema>
type FormInput = z.input<typeof formSchema> & {
  price: string | number | undefined
}

type ActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: ShippingRegion | null
  existingRegions: ShippingRegion[]
}

export function ActionDialog({
  open,
  onOpenChange,
  currentRow,
  existingRegions,
}: ActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { addRegion, updateRegion } = useShippingRegions()
  const isEdit = !!currentRow

  const form = useForm<FormInput, any, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          region: currentRow.region,
          deliveryType: currentRow.deliveryType,
          duration: currentRow.duration,
          price: currentRow.price.toString(),
        }
      : { region: '', deliveryType: '', duration: '', price: '' },
  })

  async function onSubmit(data: FormValues) {
    setIsLoading(true)
    try {
      const payload = {
        region: data.region,
        price: data.price,
        deliveryType: data.deliveryType,
        duration: data.duration,
      }

      if (isEdit) {
        const response = await axios.put(
          `${apiUrl(API_CONFIG.ENDPOINTS.SHIPPING_FEE.UPDATE)}/${
            currentRow.id
          }`,
          payload
        )
        updateRegion(currentRow.id, { ...payload, id: currentRow.id })
        toast.success('Shipping region updated successfully!')
      } else {
        const response = await axios.post(
          apiUrl(API_CONFIG.ENDPOINTS.SHIPPING_FEE.CREATE),
          payload
        )
        // Assuming the API returns the created object with an ID
        addRegion({
          ...payload,
          id: response.data.id,
        })
        toast.success('Shipping region added successfully!')
      }
      form.reset()
      onOpenChange(false)
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        (isEdit
          ? 'Failed to update shipping region.'
          : 'Failed to add shipping region.')
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Update Region' : 'Add Region'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the shipping price for this region.'
              : 'Add a new shipping region and price.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='action-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='region'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Region</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select a region' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {regionOptions.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r.charAt(0).toUpperCase() +
                            r.slice(1).replace('-', ' ')}
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
              name='deliveryType'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Delivery Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select a delivery type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {deliveryTypeOptions.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
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
              name='duration'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g., 3-5 working days' {...field} />
                  </FormControl>
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
                    <Input
                      type='number'
                      placeholder='Enter price'
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='action-form' disabled={isLoading}>
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isEdit ? 'Update' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
