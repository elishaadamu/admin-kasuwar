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
import { Textarea } from '@/components/ui/textarea'
import statesData from '../data/states.json'
import { useUsers } from './users-provider'

const MAX_FILE_SIZE = 50 * 1024 // 50KB
const REQUIRED_NUMBER_OF_IMAGES = 4

const formSchema = z
  .object({
    name: z.string().min(1, 'Product name is required.'),
    description: z.string().min(1, 'Description is required.'),
    category: z.string().min(1, 'Category is required.'),
    price: z.number().min(0.01, 'Price must be greater than 0.'),
    state: z.string().min(1, 'State is required.'),
    minOrder: z.number().min(1, 'Minimum order must be at least 1.'),
    condition: z.string().min(1, 'Condition is required.'),
    stock: z.number().min(0, 'Stock cannot be negative.'),
    images: z.array(z.any()),
    isEdit: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const imageFiles = data.images.filter(
      (img) => img instanceof File
    ) as File[]

    // Check file size for new files
    for (const file of imageFiles) {
      if (file.size > MAX_FILE_SIZE) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Each new file size should be less than 50KB.`,
          path: ['images'],
        })
        return
      }
    }

    // In create mode, exactly 4 images are required.
    if (!data.isEdit) {
      if (data.images.length !== REQUIRED_NUMBER_OF_IMAGES) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `You must upload exactly ${REQUIRED_NUMBER_OF_IMAGES} images.`,
          path: ['images'],
        })
      }
    }
  })

type ProductForm = z.infer<typeof formSchema>

interface Product {
  _id: string
  name: string
  description: string
  category: string
  price: number
  state: string
  minOrder: number
  condition: string
  stock: number
  images: { url: string; public_id: string }[] // Assuming images are stored as objects with url/public_id
}

type UsersActionDialogProps = {
  currentRow?: Product
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({
  currentRow,
  open,
  onOpenChange,
}: UsersActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const isEdit = !!currentRow
  const { user } = useAuth()
  const { addUser, updateUser } = useUsers()

  useEffect(() => {
    const fetchCategories = async () => {
      if (!user?.id) return
      try {
        const response = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.CATEGORY.GET)
        )
        const categoryNames =
          response.data?.categories?.map((cat: { name: string }) => cat.name) ||
          []
        setCategories(categoryNames)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
        toast.error('Failed to load categories for the form.')
      }
    }

    fetchCategories()
  }, [user?.id])

  const form = useForm<ProductForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          ...currentRow,
          price: currentRow.price,
          minOrder: currentRow.minOrder,
          stock: currentRow.stock,
          images: currentRow.images || [],
          isEdit,
        }
      : {
          name: '',
          description: '',
          category: '',
          price: 0,
          state: '',
          minOrder: 1,
          condition: '',
          stock: 0,
          images: [],
          isEdit,
        },
  })

  const onSubmit = async (values: ProductForm) => {
    setIsLoading(true)
    try {
      const { isEdit: _, images, ...productPayload } = values

      const formData = new FormData()

      Object.entries(productPayload).forEach(([key, value]) => {
        formData.append(key, String(value))
      })

      if (isEdit) {
        const newImages = images.filter(
          (img): img is File => img instanceof File
        )
        const existingImages = images.filter(
          (img) => typeof img === 'object' && !(img instanceof File)
        )

        newImages.forEach((image) => {
          formData.append('images', image)
        })

        formData.append('existingImages', JSON.stringify(existingImages))

        const response = await axios.put(
          `${apiUrl(API_CONFIG.ENDPOINTS.PRODUCT.UPDATE)}${user?.id}/${currentRow?._id}`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        console.log('Update', response.data)
        updateUser(currentRow._id, response.data.product)
        toast.success(response.data.message || 'Product updated successfully!')
      } else {
        if (images && images.length > 0) {
          images.filter(Boolean).forEach((image) => {
            formData.append('images', image)
          })
        }

        const response = await axios.post(
          `${apiUrl(API_CONFIG.ENDPOINTS.PRODUCT.CREATE)}${user?.id}`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        addUser(response.data.product)
        toast.success('Product added successfully!')
      }
      form.reset()
      onOpenChange(false)
    } catch (error: any) {
      console.error(error)
      const errorMessage =
        error.response?.data?.message ||
        (isEdit ? 'Failed to update product.' : 'Failed to add new product.')
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
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the product's details here. "
              : 'Create a new product here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='h-[100%] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='product-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2'>Product Name</FormLabel>
                    <FormControl className='col-span-4'>
                      <Input placeholder='Enter product name' {...field} />
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
                        placeholder='Enter product description'
                        className='resize-none'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2'>Category</FormLabel>
                    <FormControl className='col-span-4 w-full'>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select product category' />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category, index) => (
                            <SelectItem
                              key={`${category}-${index}`}
                              value={category}
                            >
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='price'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2'>Price</FormLabel>
                    <FormControl className='col-span-4'>
                      <Input
                        type='number'
                        placeholder='Enter product price'
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
                name='state'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2'>
                      Location (State)
                    </FormLabel>
                    <FormControl className='col-span-4 w-full'>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product's state" />
                        </SelectTrigger>
                        <SelectContent>
                          {statesData.states.map((state, index) => (
                            <SelectItem key={`${state}-${index}`} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='minOrder'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2'>Min Order</FormLabel>
                    <FormControl className='col-span-4'>
                      <Input
                        type='number'
                        placeholder='Enter minimum order quantity'
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='condition'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2'>Condition</FormLabel>
                    <FormControl className='col-span-4'>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select product condition' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='NEW'>New</SelectItem>
                          <SelectItem value='USED'>Used</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='stock'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2'>Stock</FormLabel>
                    <FormControl className='col-span-4'>
                      <Input
                        type='number'
                        placeholder='Enter product stock'
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='images'
                render={({ field: { value = [], onChange } }) => (
                  <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 pt-2'>Images</FormLabel>
                    <div className='col-span-4 space-y-2'>
                      {Array.from({ length: REQUIRED_NUMBER_OF_IMAGES }).map(
                        (_, index) => {
                          const file = value?.[index]
                          const existingImage = isEdit
                            ? file instanceof File
                              ? null
                              : file
                            : null
                          const previewUrl =
                            file instanceof File
                              ? URL.createObjectURL(file)
                              : existingImage?.url

                          return (
                            <div
                              key={index}
                              className='flex items-center gap-2'
                            >
                              {previewUrl && (
                                <img
                                  src={previewUrl}
                                  alt={`Preview ${index + 1}`}
                                  className='h-10 w-10 rounded-md object-cover'
                                  onLoad={() => {
                                    if (file instanceof File) {
                                      URL.revokeObjectURL(previewUrl)
                                    }
                                  }} // Clean up object URL for new files
                                />
                              )}
                              <FormControl>
                                <Input
                                  type='file'
                                  accept='image/*'
                                  className='flex-1'
                                  onChange={(event) => {
                                    const selectedFile =
                                      event.target.files?.[0] || null

                                    if (selectedFile) {
                                      if (selectedFile.size > MAX_FILE_SIZE) {
                                        toast.error(
                                          `Image "${selectedFile.name}" is too large. Max size is 50KB.`
                                        )
                                        event.target.value = '' // Clear the input
                                        return
                                      } else {
                                        const newFiles = Array.isArray(value)
                                          ? [...value]
                                          : []
                                        newFiles[index] = selectedFile
                                        onChange(newFiles) // Update form state
                                      }
                                    }
                                  }}
                                />
                              </FormControl>
                            </div>
                          )
                        }
                      )}
                    </div>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button
            type='submit'
            form='product-form'
            disabled={isLoading || categories.length === 0}
          >
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isEdit
              ? isLoading
                ? 'Saving...'
                : 'Save changes'
              : isLoading
                ? 'Adding...'
                : 'Add Product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
