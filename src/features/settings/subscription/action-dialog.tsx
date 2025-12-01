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
import { Textarea } from '@/components/ui/textarea'
import { type Subscription } from './data/schema'
import { useSubscriptions } from './provider'

// @ts-nocheck

// @ts-nocheck

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]

const formSchema = z.object({
  package: z.string().min(1, 'Package name is required.'),
  products: z.coerce
    .number({
      required_error: 'Product amount is required.',
      invalid_type_error: 'Product amount must be a number.',
    })
    .min(0, 'Amount must be a positive number.'),
  price: z.coerce
    .number({
      required_error: 'Price is required.',
      invalid_type_error: 'Price must be a number.',
    })
    .min(0, 'Price must be a positive number.'),
  duration: z.coerce
    .number({
      required_error: 'Duration is required.',
      invalid_type_error: 'Duration must be a number.',
    })
    .int()
    .min(1, 'Duration must be at least 1 day.'),
  description: z.string().min(1, 'Description is required.'),
  image: z
    .any()
    .refine((files) => {
      if (!files || files.length === 0) return true // Optional
      return files?.[0]?.size <= MAX_FILE_SIZE
    }, `Max image size is 5MB.`)
    .refine((files) => {
      if (!files || files.length === 0) return true // Optional
      return ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type)
    }, 'Only .jpg, .jpeg, .png and .webp formats are supported.'),
})

type FormValues = z.infer<typeof formSchema>

type ActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Subscription | null
}

export function ActionDialog({
  open,
  onOpenChange,
  currentRow,
}: ActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const { user } = useAuth()
  const { addSubscription, updateSubscription } = useSubscriptions()
  const isEdit = !!currentRow

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          package: currentRow.name, // Assuming name is package
          price: currentRow.price,
          duration: currentRow.duration,
          products:
            (currentRow as any).products || (currentRow as any).amount || 0,
          description: (currentRow as any).description || '',
          image: undefined,
        }
      : // @ts-expect-error - name is not in form schema, should be package
        {
          package: '',
          products: 0,
          price: 0,
          duration: 30,
          description: '',
          image: undefined,
        },
  })

  useEffect(() => {
    if (isEdit && (currentRow as any).image) {
      setImagePreview((currentRow as any).image)
    }
  }, [currentRow, isEdit])

  async function onSubmit(data: FormValues) {
    setIsLoading(true)
    try {
      let imageBase64: string | undefined = isEdit
        ? (currentRow as any).image
        : undefined

      if (data.image && data.image.length > 0) {
        const file = data.image[0]
        imageBase64 = await fileToBase64(file)
      }

      const payload = {
        package: data.package,
        price: data.price,
        products: data.products,
        duration: data.duration,
        description: data.description,
        image: imageBase64,
      }

      if (isEdit) {
        if (!user?.id) throw new Error('Admin user ID is not available.')
        const response = await axios.put(
          `${apiUrl(
            API_CONFIG.ENDPOINTS.SUBSCRIPTION.UPDATE
          )}${user.id}/${currentRow.id}`,
          payload
        )
        updateSubscription(currentRow.id, response.data)
        toast.success('Subscription updated successfully!')
      } else {
        if (!user?.id) throw new Error('Admin user ID is not available.')
        const response = await axios.post(
          `${apiUrl(API_CONFIG.ENDPOINTS.SUBSCRIPTION.CREATE)}${user.id}`,
          payload
        )
        addSubscription(response.data)
        toast.success('Subscription added successfully!')
      }
      form.reset()
      onOpenChange(false)
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        (isEdit
          ? 'Failed to update subscription.'
          : 'Failed to add subscription.')
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex h-full flex-col sm:max-h-[90vh] sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Update Subscription' : 'Add Subscription'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the subscription details.'
              : 'Add a new subscription plan.'}
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
                name='package'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter package name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='products'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Limit</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='Enter product '
                        {...field}
                      />
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='duration'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (in days)</FormLabel>
                    <FormControl>
                      <Input type='number' placeholder='e.g., 30' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Enter description' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='image'
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    {imagePreview && (
                      <img // eslint-disable-line @next/next/no-img-element
                        src={imagePreview}
                        alt='Image Preview'
                        className='mt-2 h-24 w-24 rounded-md object-cover'
                      />
                    )}
                    <FormControl>
                      <Input
                        type='file'
                        accept='image/*'
                        {...rest}
                        onChange={(event) => {
                          const file = event.target.files?.[0]
                          if (file) {
                            const previewUrl = URL.createObjectURL(file)
                            setImagePreview(previewUrl)
                          } else {
                            setImagePreview(null)
                          }
                          onChange(event.target.files)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
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
