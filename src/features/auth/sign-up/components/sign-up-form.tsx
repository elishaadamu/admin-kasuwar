// @ts-nocheck
import { useState, useEffect } from 'react'
import { z } from 'zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { apiUrl, API_CONFIG } from '@/config/api'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { PasswordInput } from '@/components/password-input'

const formSchema = z
  .object({
    // Personal details
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    middleName: z.string().optional(),
    gender: z.string().min(1, 'Gender is required'),
    maritalStatus: z.string().min(1, 'Marital status is required'),
    dateOfBirth: z
      .date()
      .nullable()
      .refine((date) => date !== null, {
        message: 'Date of birth is required',
      }),
    address: z.string().min(1, 'Address is required'),
    state: z.string().min(1, 'State is required'),
    localGovt: z.string().min(1, 'Local Government is required'),
    phone: z.string().min(1, 'Phone number is required'),

    // ID verification
    validId: z.string().min(1, 'Valid ID (NIN/BVN) is required'),
    bankName: z.string().min(1, 'Bank name is required'),
    accountNumber: z.string().min(1, 'Account number is required'),
    accountName: z.string().min(1, 'Account name is required'),
    passportPhoto: z
      .any()
      .refine((files) => files?.length == 1, 'Passport photograph is required.')

      .refine(
        (files) => files?.[0]?.size <= 50 * 1024, // 50KB
        'Maximum file size is 50KB.'
      ),

    // Auth
    email: z.email({
      error: (iss) =>
        iss.input === '' ? 'Please enter your email' : undefined,
    }),
    password: z
      .string()
      .min(1, 'Please enter your password')
      .min(7, 'Password must be at least 7 characters long'),

    // Skill selection
    skillDigitalMarketing: z.boolean().default(false).optional(),
    skillTimeManagement: z.boolean().default(false).optional(),
    skillCustomerService: z.boolean().default(false).optional(),
    skillTeamManagement: z.boolean().default(false).optional(),

    role: z.string().min(1, 'Please select a role'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

export function SignUpForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [states, setStates] = useState<string[]>([])
  const [lgas, setLgas] = useState<string[]>([])
  const [isLgasLoading, setIsLgasLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      firstName: '',
      lastName: '',
      middleName: '',
      gender: '',
      maritalStatus: '',
      address: '',
      state: '',
      localGovt: '',
      phone: '',
      validId: '',
      bankName: '',
      accountNumber: '',
      accountName: '',
      email: '',
      password: '',
      confirmPassword: '',
      skillDigitalMarketing: false,
      skillTimeManagement: false,
      skillCustomerService: false,
      skillTeamManagement: false,
      role: '',
      // passportPhoto will be handled by the file input
    },
  })

  const handleNextStep = async () => {
    let isValid = false
    if (currentStep === 0) {
      isValid = await form.trigger([
        'firstName',
        'lastName',
        'middleName',
        'gender',
        'maritalStatus',
        'dateOfBirth',
        'phone',
        'email',
        'password',
        'confirmPassword',
      ])
    } else if (currentStep === 1) {
      isValid = await form.trigger([
        'address',
        'state',
        'localGovt',
        'validId',
        'bankName',
        'accountNumber',
        'accountName',
        'passportPhoto',
      ])
    }

    if (isValid) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePreviousStep = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const handleCancel = () => {
    form.reset() // Resets all form fields to default values
    setCurrentStep(0) // Go back to the first step
    setPhotoPreview(null) // Clear photo preview
  }

  const selectedState = form.watch('state')
  const passportPhoto = form.watch('passportPhoto')

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
        toast.error('Could not load states. Please check your connection.')
      }
    }
    getStates()
  }, [])

  useEffect(() => {
    if (selectedState) {
      const getLgas = async () => {
        setIsLgasLoading(true)
        try {
          const response = await fetch(
            `https://nga-states-lga.onrender.com/?state=${selectedState}`
          )
          const data = await response.json()
          setLgas(data)
        } catch (error) {
          console.error('Failed to fetch LGAs:', error)
          toast.error('Could not load LGAs for the selected state.')
        } finally {
          setIsLgasLoading(false)
        }
      }
      getLgas()
    }
  }, [selectedState])

  useEffect(() => {
    if (passportPhoto && passportPhoto.length > 0) {
      const file = passportPhoto[0]
      const newUrl = URL.createObjectURL(file)
      setPhotoPreview(newUrl)

      return () => URL.revokeObjectURL(newUrl)
    } else {
      setPhotoPreview(null)
    }
  }, [passportPhoto])

  // Watch for changes in passportPhoto to trigger validation when a file is selected
  if (currentStep === 1 && passportPhoto && passportPhoto.length > 0) {
    form.trigger('passportPhoto')
  }

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    const fileToBase64 = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = (error) => reject(error)
      })

    const skills = Object.entries(data)
      .filter(([key, value]) => key.startsWith('skill') && value)
      .map(([key]) => key.replace('skill', ''))

    const {
      confirmPassword,
      passportPhoto,
      skillDigitalMarketing,
      skillTimeManagement,
      skillCustomerService,
      skillTeamManagement,
      ...restOfData
    } = data

    try {
      const passportPhotoBase64 = await fileToBase64(data.passportPhoto[0])

      const payload = {
        ...restOfData,
        dateOfBirth: data.dateOfBirth
          ? data.dateOfBirth.toISOString().split('T')[0]
          : undefined,
        passportPhoto: passportPhotoBase64,
        skills: skills,
      }
      console.log('Payload to be sent:', payload)
      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.AUTH.SIGNUP),
        payload
      )
      toast.success('Account created successfully! ')
      console.log('Server Response:', response.data)
      navigate({ to: '/sign-in' })
    } catch (error) {
      toast.error(error.response.data.message)
      console.error('Signup Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        {currentStep === 0 && (
          <>
            <h3 className='font-semibold'>Personal Details</h3>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='firstName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder='John' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='lastName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Doe' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='middleName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Middle Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder='Michael' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-2 gap-3 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='gender'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className='w-full'>
                        <SelectTrigger>
                          <SelectValue placeholder='Select your gender' />
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
              <FormField
                control={form.control}
                name='maritalStatus'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marital Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className='w-full'>
                        <SelectTrigger>
                          <SelectValue placeholder='Select your marital status' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='single'>Single</SelectItem>
                        <SelectItem value='married'>Married</SelectItem>
                        <SelectItem value='divorced'>Divorced</SelectItem>
                        <SelectItem value='widowed'>Widowed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='dateOfBirth'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <DatePicker
                      selected={field.value}
                      onChange={field.onChange}
                      dateFormat='PPP'
                      placeholderText='Pick a date'
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode='select'
                      maxDate={new Date()}
                      minDate={new Date('1900-01-01')}
                      className='w-full'
                      customInput={<Input />}
                    />
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
                    <Input placeholder='123 Main St' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder='+234...' {...field} />
                    </FormControl>
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
                      <Input placeholder='name@example.com' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder='********' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder='********' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        {currentStep === 1 && (
          <>
            <h3 className='pt-4 font-semibold'>Address & ID Verification</h3>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='state'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className='w-full'>
                        <SelectTrigger>
                          <SelectValue placeholder='Select your state' />
                        </SelectTrigger>
                      </FormControl>
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
                name='localGovt'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local Government</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!selectedState || isLgasLoading}
                    >
                      <FormControl className='w-full'>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLgasLoading
                                ? 'Loading LGAs...'
                                : 'Select your LGA'
                            }
                          />
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
              name='validId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valid ID (NIN/BVN)</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter your NIN or BVN' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='bankName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. Zenith Bank' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='accountNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input placeholder='0123456789' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='accountName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Name</FormLabel>
                    <FormControl>
                      <Input placeholder='John Doe' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='passportPhoto'
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Passport Photograph</FormLabel>
                  <FormControl>
                    <Input
                      {...fieldProps}
                      type='file'
                      accept='image/png, image/jpeg, image/jpg'
                      onChange={(event) => onChange(event.target.files)}
                    />
                  </FormControl>
                  {photoPreview && (
                    <div className='mt-2'>
                      <img
                        src={photoPreview}
                        alt='Passport preview'
                        className='h-24 w-24 rounded-md object-cover'
                      />
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {currentStep === 2 && (
          <>
            <h3 className='pt-4 font-semibold'>Skill Selection</h3>
            <p className='text-muted-foreground text-sm'>Select your skills.</p>
            <SkillCheckbox
              form={form}
              name='skillDigitalMarketing'
              label='Digital Marketing'
            />
            <SkillCheckbox
              form={form}
              name='skillTimeManagement'
              label='Time Management'
            />
            <SkillCheckbox
              form={form}
              name='skillCustomerService'
              label='Customer Service'
            />
            <SkillCheckbox
              form={form}
              name='skillTeamManagement'
              label='Team Management'
            />
            <FormField
              control={form.control}
              name='role'
              render={({ field }) => (
                <FormItem className='pt-2'>
                  <FormLabel>Select Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl className='w-full'>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a role' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='bdm'>
                        BDM (Business Development Manager)
                      </SelectItem>
                      <SelectItem value='bd'>
                        BD (Business Developer)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <div className='flex justify-between pt-4'>
          <div className='flex gap-2'>
            {currentStep > 0 && (
              <Button
                type='button'
                variant='destructive'
                onClick={handleCancel}
              >
                Cancel
              </Button>
            )}
            {currentStep > 0 && (
              <Button
                type='button'
                variant='outline'
                onClick={handlePreviousStep}
              >
                Previous
              </Button>
            )}
          </div>
          {currentStep < 2 && (
            <Button type='button' onClick={handleNextStep}>
              Next
            </Button>
          )}
          {currentStep === 2 && (
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}

function SkillCheckbox({
  form,
  name,
  label,
}: {
  form: any
  name: any
  label: string
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className='flex flex-row items-start space-y-0 space-x-3'>
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <FormLabel className='font-normal'>{label}</FormLabel>
        </FormItem>
      )}
    />
  )
}
