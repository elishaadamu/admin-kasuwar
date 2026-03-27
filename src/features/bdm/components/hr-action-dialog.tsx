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
import { useUsers } from './users-provider'

const formSchema = z.object({
  firstName: z.string().min(1, 'First Name is required.'),
  lastName: z.string().min(1, 'Last Name is required.'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z.string().min(1, 'Phone number is required.'),
  password: z.string().optional(),
})

type HRForm = z.infer<typeof formSchema>

type HRActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HRActionDialog({
  open,
  onOpenChange,
}: HRActionDialogProps) {
  const { addUser } = useUsers()
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<HRForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
    },
  })

  const onSubmit = async (values: HRForm) => {
    setIsLoading(true)
    try {
      const payload = {
        ...values,
        password: values.password || values.phone,
      }
      console.log('HR creation payload:', payload)
      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.HR.CREATE),
        payload,
        {withCredentials: true}
      )
      console.log('HR creation response:', response.data)
      toast.success('HR created successfully!')
      
      // Update UI
      const newItem = response.data.hr || response.data
      addUser({
        ...newItem,
        name: newItem.name || `${values.firstName} ${values.lastName}`,
        id: newItem._id || newItem.id
      })
      
      form.reset()
      onOpenChange(false)
    } catch (error: any) {
      console.error(error)
      const errorMessage =
        error.response?.data?.message || 'Failed to create HR.'
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
      <DialogContent className='m-4 sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle>Add New HR</DialogTitle>
          <DialogDescription>
            Create a new HR account here. Note: If password is not provided, phone number will be used.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='hr-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='firstName'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>
                    First Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='John'
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
              name='lastName'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>
                    Last Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Doe'
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
              name='email'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='john.doe@example.com'
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
              name='phone'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>
                    Phone Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='+123456789'
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
              name='password'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='Optional'
                      className='col-span-4'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='hr-form' disabled={isLoading}>
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isLoading ? 'Creating...' : 'Add HR'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
