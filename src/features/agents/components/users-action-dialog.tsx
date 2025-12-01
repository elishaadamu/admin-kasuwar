'use client'

import { useEffect, useState } from 'react'
import { z } from 'zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { API_CONFIG, apiUrl } from '@/config/api'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { showSubmittedData } from '@/lib/show-submitted-data'
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
import { type User } from '../data/schema'

const formSchema = z.object({
  firstName: z.string().min(1, 'First Name is required.'),
  lastName: z.string().min(1, 'Last Name is required.'),
  username: z.string().optional(),
  phoneNumber: z.string().min(1, 'Phone number is required.'),
  state: z.string().min(1, 'State is required.'),
  nin: z.string().min(1, 'NIN is required.'),
  bankName: z.string().min(1, 'Bank name is required.'),
  accountName: z.string().min(1, 'Account name is required.'),
  accountNumber: z.string().min(1, 'Account number is required.'),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  role: z.string().optional(),
  isEdit: z.boolean(),
})
type UserForm = z.infer<typeof formSchema>

type UserActionDialogProps = {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({
  currentRow,
  open,
  onOpenChange,
}: UserActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [states, setStates] = useState<string[]>([])
  const isEdit = !!currentRow
  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          ...currentRow,
          isEdit,
        }
      : {
          firstName: '',
          lastName: '',
          username: '',
          email: '',
          role: '',
          phoneNumber: '',
          state: '',
          nin: '',
          bankName: '',
          accountName: '',
          accountNumber: '',
          isEdit,
        },
  })

  const { user } = useAuth()

  useEffect(() => {
    const getStates = async () => {
      try {
        const response = await fetch(
          'https://nga-states-lga.onrender.com/fetch'
        )
        const data = await response.json()
        if (data && Array.isArray(data)) {
          setStates(data)
        }
      } catch (error) {
        console.error('Failed to fetch states:', error)
      }
    }
    getStates()
  }, [])

  const onSubmit = async (values: UserForm) => {
    setIsLoading(true)
    try {
      if (isEdit) {
        // TODO: Implement update logic (e.g., axios.put)
        showSubmittedData(values, 'Agent updated:')
        toast.success('Agent updated successfully!')
      } else {
        const payload = {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phoneNumber,
          email: values.email,
          state: values.state,
          nin: values.nin,
          bankName: values.bankName,
          accountName: values.accountName,
          accountNumber: values.accountNumber,
          type: 'agent',
          managerId: user?._id,
          role: user?.role,
        }
        console.log('Payload:', payload)
        const response = await axios.post(
          apiUrl(API_CONFIG.ENDPOINTS.USER.CREATE),
          payload
        )
        console.log(response.data)

        toast.success('Agent added successfully!')
      }
      form.reset()
      onOpenChange(false)
    } catch (error: any) {
      console.error(error)
      const errorMessage =
        error.response?.data?.message ||
        (isEdit ? 'Failed to update agent.' : 'Failed to add new agent.')
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
          <DialogTitle>{isEdit ? 'Edit agent' : 'Add New agent'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the agent here. ' : 'Create new agent here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='h-[100%] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
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
                    <FormLabel className='col-span-2 text-end'>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='john.doe@gmail.com'
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
                name='phoneNumber'
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
                name='state'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>State</FormLabel>
                    <FormControl className=''>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className='col-span-4 w-full'>
                          <SelectValue placeholder='Select a state' />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map((state) => (
                            <SelectItem key={state} value={state}>
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
                name='nin'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>NIN</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='National Identification Number'
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
                name='bankName'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Bank Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g. Zenith Bank'
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
                name='accountName'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Account Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Account holder name'
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
                name='accountNumber'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Account Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='0123456789'
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
        </div>
        <DialogFooter>
          <Button type='submit' form='user-form'>
            {isLoading ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : null}
            {isEdit
              ? isLoading
                ? 'Saving...'
                : 'Save changes'
              : isLoading
                ? 'Adding...'
                : 'Add agent'}
          </Button>
        </DialogFooter>
        <p className='mb-4 text-center text-sm text-gray-500'>
          Note: Password is the Agent Phone number
        </p>
      </DialogContent>
    </Dialog>
  )
}
