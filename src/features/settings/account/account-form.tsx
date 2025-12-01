// @ts-nocheck
import { useEffect, useState } from 'react'
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
  email: z.string().email(),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  state: z.string().min(1, 'State is required'),
  localGovt: z.string().min(1, 'Local Government is required'),
  gender: z.string().min(1, 'Gender is required'),
  avatar: z.any().optional(),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

interface AccountFormProps {
  onUpdate: (data: AccountFormValues) => void
}

export function AccountForm({ onUpdate }: AccountFormProps) {
  const { user } = useAuth()
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const defaultValues: Partial<AccountFormValues> = {
    name: user ? `${user.firstName} ${user.lastName}`.trim() : '',
    dob: user?.dateOfBirth ? new Date(user.dateOfBirth) : undefined,
    language: 'en', // Defaulting to English
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    state: user?.state || '',
    localGovt: user?.localGovt || '',
    gender: user?.gender || '',
    avatar: user?.passportPhoto,
  }

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues,
  })

  const avatar = form.watch('avatar')

  function onSubmit(data: AccountFormValues) {
    onUpdate(data)
    showSubmittedData(data)
  }

  useEffect(() => {
    if (user) {
      form.reset(defaultValues)
    }
  }, [user, form])

  useEffect(() => {
    if (avatar && avatar.length > 0 && typeof avatar !== 'string') {
      const file = avatar[0]
      const newUrl = URL.createObjectURL(file)
      setAvatarPreview(newUrl)

      return () => URL.revokeObjectURL(newUrl)
    }
    setAvatarPreview(user?.passportPhoto ?? null)
  }, [avatar, user?.passportPhoto])

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
                <Input placeholder='your.email@example.com' {...field} />
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
        <FormField
          control={form.control}
          name='address'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder='Your address' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='state'
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Input placeholder='Your state' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='localGovt'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Local Government</FormLabel>
              <FormControl>
                <Input placeholder='Your Local Government Area' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='dob'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>Date of birth</FormLabel>
              <DatePicker selected={field.value} onSelect={field.onChange} />
              <FormDescription>
                Your date of birth is used to calculate your age.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='avatar'
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormLabel>Profile Picture</FormLabel>
              <div className='flex items-center space-x-4'>
                <Avatar className='h-20 w-20'>
                  <AvatarImage src={avatarPreview || ''} />
                  <AvatarFallback>
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <FormControl>
                  <Input
                    type='file'
                    {...rest}
                    onChange={(event) => {
                      onChange(event.target.files)
                    }}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit'>Update account</Button>
      </form>
    </Form>
  )
}
