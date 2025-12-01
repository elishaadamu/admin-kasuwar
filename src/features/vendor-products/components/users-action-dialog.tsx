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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useUsers } from './users-provider'

// @ts-nocheck

const formSchema = z.object({
  name: z.string().min(1, 'Category name is required.'),
  chargePercentage: z
    .number()
    .min(0, 'Charge percentage must be at least 0.')
    .max(100, 'Charge percentage cannot exceed 100.'),
  description: z.string().min(1, 'Description is required.'),
  isEdit: z.boolean(),
})

type CategoryForm = z.infer<typeof formSchema>

interface Category {
  _id: string
  name: string
  chargePercentage: number
  description: string
}

type UsersActionDialogProps = {
  currentRow?: Category
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({
  currentRow,
  open,
  onOpenChange,
}: UsersActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEdit = !!currentRow
  const { user } = useAuth()
  const { addUser, updateUser } = useUsers()

  const form = useForm<CategoryForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          ...currentRow,
          isEdit,
        }
      : {
          name: '',
          chargePercentage: 0,
          description: '',
          isEdit,
        },
  })

  const onSubmit = async (values: CategoryForm) => {
    setIsLoading(true)
    try {
      const { isEdit: _, ...payload } = values

      if (isEdit) {
        const response = await axios.put(
          `${apiUrl(API_CONFIG.ENDPOINTS.PRODUCT.UPDATE)}${user?.id}/${currentRow?._id}`,
          payload
        )
        updateUser(currentRow._id, response.data.category)
        toast.success('Category updated successfully!')
      } else {
        const response = await axios.post(
          `${apiUrl(API_CONFIG.ENDPOINTS.PRODUCT.CREATE)}${user?.id}`,
          payload
        )
        addUser(response.data.category)
        toast.success('Category added successfully!')
      }
      form.reset()
      onOpenChange(false)
    } catch (error: any) {
      console.error(error)
      const errorMessage =
        error.response?.data?.message ||
        (isEdit ? 'Failed to update products.' : 'Failed to add new products.')
      toast.error(errorMessage)
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
      <DialogContent className='m-4 h-full sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>
            {isEdit ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the category details here. '
              : 'Create new category here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='h-[100%] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='category-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2'>Name</FormLabel>
                    <FormControl className='col-span-4'>
                      <Input placeholder='Enter category name' {...field} />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='chargePercentage'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2'>
                      Charge Percentage
                    </FormLabel>
                    <FormControl className='col-span-4'>
                      <Input
                        type='number'
                        placeholder='Enter charge percentage'
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2'>Description</FormLabel>
                    <FormControl className='col-span-4'>
                      <Textarea
                        placeholder='Enter category description'
                        className='resize-none'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='category-form' disabled={isLoading}>
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isEdit
              ? isLoading
                ? 'Saving...'
                : 'Save changes'
              : isLoading
                ? 'Adding...'
                : 'Add Category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
