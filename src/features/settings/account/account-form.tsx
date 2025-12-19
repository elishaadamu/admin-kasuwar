// @ts-nocheck
import { useEffect, useState } from 'react'
import axios from 'axios'
import { API_CONFIG, apiUrl } from '@/config/api'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { useAuth } from '@/context/auth-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { toast } from 'sonner'

const accountFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters.')
    .max(30, 'Name must not be longer than 30 characters.'),
  dob: z.date({
    required_error: 'A date of birth is required.',
  }),
  language: z.string({
    required_error: 'Please select a language.',
  }),
  email: z.string().optional(),
  phone: z.string().min(1, 'Phone number is required'),
  phone: z.string().min(1, 'Phone number is required'),
  shippingAddress: z.string().min(1, 'Shipping Address is required'),
  shippingState: z.string().min(1, 'Shipping State is required'),
  shippingLga: z.string().min(1, 'Shipping Local Government is required'),
  shippingLga: z.string().min(1, 'Shipping Local Government is required'),
  gender: z.string().min(1, 'Gender is required'),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

interface AccountFormProps {
  onUpdate: (data: AccountFormValues) => void
}

export function AccountForm({ onUpdate }: AccountFormProps) {
  const { user } = useAuth()
  const [states, setStates] = useState<string[]>([])
  const [lgas, setLgas] = useState<string[]>([])
  const [userData, setUserData] = useState<any>(null)
  const [isLoadingStates, setIsLoadingStates] = useState(false)
  const [isLoadingLgas, setIsLoadingLgas] = useState(false)


    useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user?.id) return
      try {
        const response = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.USER.GET_DETAILS + user.id)
        )
        console.log("User details", response.data)
        setUserData(response.data.user)
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || 'Failed to fetch account details.'
        )
        console.error('Fetch Error:', error)
      }
    }
    fetchUserDetails()
  }, [user?.id])
  
  const defaultValues: Partial<AccountFormValues> = {
    name: userData
      ? `${userData.firstName} ${userData.lastName}`.trim()
      : user
      ? `${user.firstName} ${user.lastName}`.trim()
      : '',
    dob: userData?.dateOfBirth
      ? new Date(userData.dateOfBirth)
      : user?.dateOfBirth
      ? new Date(user.dateOfBirth)
      : undefined,
    language: 'en', // Defaulting to English
    email: userData?.email || user?.email || '',
    phone: userData?.phone || user?.phone || '',
    shippingAddress: userData?.shippingAddress || user?.address || '',
    shippingState: userData?.shippingState || user?.state || '',
    shippingLga: userData?.localGovt || user?.localGovt || '',
    shippingLga: userData?.localGovt || user?.localGovt || '',
    gender: userData?.gender || user?.gender || '',
  }

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues,
  })


  function onSubmit(data: AccountFormValues) {
    onUpdate(data)
    showSubmittedData(data)
  }

  useEffect(() => {
    if (userData) {
      form.reset({
        name: `${userData.firstName} ${userData.lastName}`.trim(),
        dob: userData.dateOfBirth ? new Date(userData.dateOfBirth) : undefined,
        language: 'en',
        email: userData.email || '',
        phone: userData.phone || '',
        shippingAddress: userData.shippingAddress || '',
        shippingState: userData.shippingState || '',
        shippingLga: userData.localGovt || '', // Note: API might not return this yet or returns it differently logic might be needed if key differs
        gender: userData.gender || '',
      })
    } else if (user) {
      form.reset({
        name: `${user.firstName} ${user.lastName}`.trim(),
        dob: user.dateOfBirth ? new Date(user.dateOfBirth) : undefined,
        language: 'en',
        email: user.email || '',
        phone: user.phone || '',
        shippingAddress: user.address || '',
        shippingState: user.state || '',
        shippingLga: user.localGovt || '',
        gender: user.gender || '',
      })
    }
  }, [user, userData, form])


  useEffect(() => {
    const fetchStates = async () => {
      setIsLoadingStates(true)
      try {
        const response = await fetch('https://nga-states-lga.onrender.com/fetch')
        const json = await response.json()
        setStates(json || [])
      } catch (error) {
        console.error('Failed to fetch states', error)
      } finally {
        setIsLoadingStates(false)
      }
    }
    fetchStates()
  }, [])

  const selectedState = form.watch('shippingState')

  useEffect(() => {
    const fetchLgas = async () => {
      if (!selectedState) {
        setLgas([])
        return
      }
      setIsLoadingLgas(true)
      try {
        const response = await fetch(
          `https://nga-states-lga.onrender.com/?state=${selectedState}`
        )
        const json = await response.json()
        setLgas(json || [])
      } catch (error) {
        console.error('Failed to fetch LGAs', error)
      } finally {
        setIsLoadingLgas(false)
      }
    }
    fetchLgas()
  }, [selectedState])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder='Your name' {...field} />
              </FormControl>
              <FormDescription>
                This is the name that will be displayed on your profile and in
                emails.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  disabled
                  placeholder='your.email@example.com'
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This is the email that will be used for all communication.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='phone'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder='Your phone number' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
       <div className='flex gap-4'>
        <FormField
          control={form.control}
          name="shippingState"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shipping State</FormLabel>
              <Select
                disabled={isLoadingStates}
                onValueChange={(value) => {
                  field.onChange(value)
                  form.setValue('shippingLga', '') // Reset LGA when state changes
                }}
                value={field.value}
              >
                <FormControl className='w-full'>
                  <SelectTrigger >
                    <SelectValue placeholder='Select a state' />
                  </SelectTrigger>
                </FormControl >
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
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
          name='shippingLga'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shipping LGA</FormLabel>
              <Select 
                disabled={!selectedState || isLoadingLgas}
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl className='w-full'>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a LGA' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {lgas.map((lga) => (
                    <SelectItem key={lga} value={lga}>
                      {lga}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
            )}
            
          />
        
        </div>
          <FormField
          control={form.control}
          name='shippingAddress'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shipping Address</FormLabel>
              <FormControl>
                <Input placeholder='Your address' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='flex gap-4'>
           <FormField
          control={form.control}
          name='dob'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>Date of birth</FormLabel>
              <DatePicker selected={field.value} onSelect={field.onChange} />
              
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='gender'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a gender' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='male'>Male</SelectItem>
                  <SelectItem value='female'>Female</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
       </div>
        <Button type='submit'>Update account</Button>
      </form>
    </Form>
  )
}
