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
import { useUsers } from './users-provider'

// @ts-nocheck

// @ts-nocheck

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  link: z
    .string()
    .url('Please enter a valid URL.')
    .optional()
    .or(z.literal('')),
  offer: z.string().optional(),
  image: z
    .any()
    .refine(
      (files) =>
        !files || files.length === 0 || files?.[0]?.size <= 5 * 1024 * 1024, // 5MB
      'Max file size is 5MB.'
    )
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        ['image/jpeg', 'image/png', 'image/webp'].includes(files?.[0]?.type),
      'Only .jpg, .png, and .webp formats are supported.'
    )
    .optional(),
})

type BannerForm = z.infer<typeof formSchema>

type BannerActionDialogProps = {
  currentRow?: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BannerActionDialog({
  currentRow,
  open,
  onOpenChange,
}: BannerActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const isEdit = !!currentRow

  const form = useForm<BannerForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      link: '',
      offer: '',
      image: undefined,
    },
  })

  const { user: authUser } = useAuth()
  const { addUser, updateUser } = useUsers()
  const imageFile = form.watch('image')

  // Reset form when dialog opens/closes or currentRow changes
  useEffect(() => {
    if (open) {
      if (isEdit && currentRow) {
        form.reset({
          title: currentRow.title || '',
          link: currentRow.link || '',
          offer: currentRow.offer || '',
          image: undefined,
        })
        if (currentRow?.image) {
          setImagePreview(currentRow.image.url)
        }
      } else {
        form.reset({
          title: '',
          link: '',
          offer: '',
          image: undefined,
        })
        setImagePreview(null)
      }
    }
  }, [open, isEdit, currentRow, form])

  useEffect(() => {
    if (imageFile && imageFile.length > 0) {
      const file = imageFile[0]
      const newUrl = URL.createObjectURL(file)
      setImagePreview(newUrl)

      return () => URL.revokeObjectURL(newUrl)
    }
  }, [imageFile])

  const onSubmit = async (values: BannerForm) => {
    // Custom validation for image - only required when creating new banner
    if (!isEdit && (!values.image || values.image.length === 0)) {
      form.setError('image', {
        type: 'manual',
        message: 'Image is required for new banners.',
      })
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('title', values.title || '')
      formData.append('link', values.link || '')
      formData.append('offer', values.offer || '')

      // Only append image if a new one was selected
      if (values.image && values.image[0]) {
        formData.append('image', values.image[0])
      }

      const headers = {
        'Content-Type': 'multipart/form-data',
      }

      if (isEdit) {
        const response = await axios.put(
          `${apiUrl(API_CONFIG.ENDPOINTS.BANNERS.UPDATE)}/${currentRow._id}`,
          formData,
          { headers }
        )
        updateUser(currentRow._id, response.data.banner)
        toast.success('Banner updated successfully!')
      } else {
        const response = await axios.post(
          apiUrl(API_CONFIG.ENDPOINTS.BANNERS.CREATE),
          formData,
          {
            headers,
          }
        )
        addUser(response.data.banner)
        toast.success('Banner added successfully!')
      }
      form.reset()
      setImagePreview(null)
      onOpenChange(false)
    } catch (error: any) {
      console.error(error)
      const errorMessage =
        error.response?.data?.message ||
        (isEdit ? 'Failed to update banner.' : 'Failed to add new banner.')
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
          setImagePreview(null)
        }
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit Banner' : 'Add New Banner'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the banner details here. '
              : 'Create a new banner here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='h-[100%] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-6 px-0.5'
            >
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Summer Sale'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='link'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Link (optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='https://example.com/offer'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='offer'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Offer (optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., 20% OFF'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='image'
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Image {!isEdit && '*'}
                    </FormLabel>
                    <FormControl className='col-span-4'>
                      <Input
                        type='file'
                        accept='image/png, image/jpeg, image/webp'
                        onChange={(event) => {
                          onChange(event.target.files)
                        }}
                        {...rest}
                      />
                    </FormControl>
                    {imagePreview && (
                      <div className='col-span-4 col-start-3 mt-2'>
                        <img
                          src={imagePreview}
                          alt='Banner preview'
                          className='h-24 w-auto rounded-md object-contain'
                        />
                        <p className='text-muted-foreground mt-1 text-xs'>
                          {isEdit ? 'Current image' : 'Image preview'}
                        </p>
                      </div>
                    )}
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='user-form' disabled={isLoading}>
            {isLoading ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : null}
            {isEdit
              ? isLoading
                ? 'Saving...'
                : 'Save changes'
              : isLoading
                ? 'Adding...'
                : 'Add Banner'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
