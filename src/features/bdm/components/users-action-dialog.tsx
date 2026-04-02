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
import { useLocation } from '@/context/location-context'
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
import { DatePicker } from '@/components/date-picker'
import { type User } from '../data/schema'
import { useUsers } from './users-provider'

// @ts-nocheck

const formSchema = z.object({
  firstName: z.string().min(1, 'First Name is required.'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last Name is required.'),
  username: z.string().optional(),
  gender: z.string().optional(),
  maritalStatus: z.string().optional(),
  dateOfBirth: z.date().optional(),
  address: z.string().min(1, 'Address is required.'),
  phoneNumber: z.string().min(1, 'Phone number is required.'),
  state: z.string().min(1, 'State is required.'),
  localGovt: z.string().min(1, 'Local Government is required.'),
  nin: z.string().optional(),
  bankName: z.string().min(1, 'Bank name is required.'),
  accountName: z.string().min(1, 'Account name is required.'),
  accountNumber: z.string().min(1, 'Account number is required.'),
  passportPhoto: z.any().optional(),
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
  const { activeTab } = useUsers()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const roleLabels: Record<string, string> = {
    bdm: 'Business Manager (BDM)',
    sm: 'Sales Manager (SM)',
    hr: 'HR Manager',
  }
  const currentRoleLabel = roleLabels[activeTab] || 'Manager'
  const isEdit = !!currentRow
  const { states, lgas, isLgasLoading, fetchLgas } = useLocation()
  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          ...currentRow,
          isEdit,
        }
      : {
          firstName: '',
          middleName: '',
          lastName: '',
          username: '',
          email: '',
          gender: '',
          maritalStatus: '',
          dateOfBirth: undefined,
          address: '',
          role: '',
          phoneNumber: '',
          state: '',
          localGovt: '',
          nin: '',
          bankName: '',
          accountName: '',
          accountNumber: '',
          passportPhoto: undefined,
          isEdit,
        },
  })

  const { user } = useAuth()
  const selectedState = form.watch('state')
  const passportPhoto = form.watch('passportPhoto')

  useEffect(() => {
    if (selectedState) {
      // Reset LGA when state changes and fetch new ones
      form.setValue('localGovt', '')
      fetchLgas(selectedState)
    }
  }, [selectedState, fetchLgas, form])

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

  const onSubmit = async (values: UserForm) => {
    setIsLoading(true)
    try {
      if (isEdit) {
        const { isEdit: _, ...updateData } = values
        const response = await axios.put(
          `${apiUrl(API_CONFIG.ENDPOINTS.MANAGERS.DELETE)}/${currentRow?._id}`,
          updateData
        )
        console.log(response.data)
        toast.success('Manager updated successfully!')
      } else {
        let endpoint = apiUrl(API_CONFIG.ENDPOINTS.MANAGERS.CREATE) + user?.id
        let finalPayload = {}

        if (activeTab === 'sm') {
          endpoint = apiUrl(API_CONFIG.ENDPOINTS.SALES_MANAGER.CREATE) + user?.id
          // Strict payload structure for SM
          finalPayload = {
            firstName: values.firstName,
            middleName: values.middleName || '',
            lastName: values.lastName,
            email: values.email,
            phone: values.phoneNumber,
            address: values.address,
            state: values.state,
            localGovt: values.localGovt,
            accountName: values.accountName,
            accountNumber: values.accountNumber,
            bankName: values.bankName,
          }
          console.log('SM Payload:', finalPayload)
        } else {
          // Payload for BDM and HR
          const fileToBase64 = (file: File): Promise<string> =>
            new Promise((resolve, reject) => {
              const reader = new FileReader()
              reader.readAsDataURL(file)
              reader.onload = () => resolve(reader.result as string)
              reader.onerror = (error) => reject(error)
            })
            
          let passportPhotoBase64 = ''
          if (values.passportPhoto && values.passportPhoto.length > 0) {
            passportPhotoBase64 = await fileToBase64(values.passportPhoto[0])
          }

          finalPayload = {
            firstName: values.firstName,
            middleName: values.middleName || '',
            lastName: values.lastName,
            gender: values.gender,
            maritalStatus: values.maritalStatus,
            dateOfBirth: values.dateOfBirth?.toISOString(),
            address: values.address,
            state: values.state,
            localGovt: values.localGovt,
            nin: values.nin,
            validId: values.nin,
            bankName: values.bankName,
            accountName: values.accountName,
            accountNumber: values.accountNumber,
            passportPhoto: passportPhotoBase64,
            phone: values.phoneNumber,
            email: values.email,
            adminId: user?.id,
            role: roleMap[activeTab] || 'bdm',
          }

          if (activeTab === 'hr') {
            endpoint = apiUrl(API_CONFIG.ENDPOINTS.HR.CREATE)
          }
        }

        const response = await axios.post(endpoint, finalPayload)
        console.log(response.data)

        toast.success('Manager added successfully!')
      }
      form.reset()
      onOpenChange(false)
      setCurrentStep(0)
    } catch (error: any) {
      console.error(error)
      const errorMessage =
        error.response?.data?.message ||
        (isEdit ? 'Failed to update Manager.' : 'Failed to add new Manager.')
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNextStep = async () => {
    const fieldsToValidate: (keyof UserForm)[] = [
      'firstName',
      'lastName',
      'email',
      'phoneNumber',
      'gender',
      'maritalStatus',
      'dateOfBirth',
      'address',
    ]
    const step2Fields: (keyof UserForm)[] = [
      ...fieldsToValidate,
      'passportPhoto',
    ]
    const isValid = await form.trigger(fieldsToValidate)
    if (isValid) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePreviousStep = () => {
    setCurrentStep((prev) => prev - 1)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        setPhotoPreview(null)
        setCurrentStep(0)
        onOpenChange(state)
      }}
    >
      <DialogContent className='m-4 h-full sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>
            {isEdit ? `Edit ${currentRoleLabel}` : `Add New ${currentRoleLabel}`}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? `Update the ${currentRoleLabel} here. ` : `Create new ${currentRoleLabel} here. `}
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
              {currentStep === 0 && (
                <>
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
                    name='middleName'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>
                          Middle Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Quincy'
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
                  {activeTab !== 'sm' && (
                    <>
                      <FormField
                        control={form.control}
                        name='gender'
                        render={({ field }) => (
                          <FormItem className='grid w-full grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                            <FormLabel className='col-span-2 text-end'>
                              Gender
                            </FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger className='col-span-4 w-full'>
                                  <SelectValue placeholder='Select gender' />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='male'>Male</SelectItem>
                                  <SelectItem value='female'>Female</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage className='col-span-4 col-start-3' />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='maritalStatus'
                        render={({ field }) => (
                          <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                            <FormLabel className='col-span-2 text-end'>
                              Marital Status
                            </FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger className='col-span-4 w-full'>
                                  <SelectValue placeholder='Select status' />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='single'>Single</SelectItem>
                                  <SelectItem value='married'>Married</SelectItem>
                                  <SelectItem value='divorced'>Divorced</SelectItem>
                                  <SelectItem value='widowed'>Widowed</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage className='col-span-4 col-start-3' />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='dateOfBirth'
                        render={({ field }) => (
                          <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                            <FormLabel className='col-span-2 text-end'>
                              Date of Birth
                            </FormLabel>
                            <DatePicker
                              selected={field.value}
                              onSelect={field.onChange}
                            />
                            <FormMessage className='col-span-4 col-start-3' />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  <FormField
                    control={form.control}
                    name='address'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>
                          Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='123 Main St'
                            className='col-span-4'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className='col-span-4 col-start-3' />
                      </FormItem>
                    )}
                  />
                </>
              )}
              {currentStep === 1 && (
                <>
                  <FormField
                    control={form.control}
                    name='state'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>
                          State
                        </FormLabel>
                        <FormControl>
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
                    name='localGovt'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>
                          LGA
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={!selectedState || isLgasLoading}
                          >
                            <SelectTrigger className='col-span-4 w-full'>
                              <SelectValue
                                placeholder={
                                  isLgasLoading ? 'Loading...' : 'Select an LGA'
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {lgas.map((lga) => (
                                <SelectItem key={lga} value={lga}>
                                  {lga}
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
                  {activeTab !== 'sm' && (
                    <>
                      <FormField
                        control={form.control}
                        name='nin'
                        render={({ field }) => (
                          <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                            <FormLabel className='col-span-2 text-end'>
                              NIN
                            </FormLabel>
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
                        name='passportPhoto'
                        render={({ field: { value, onChange, ...fieldProps } }) => (
                          <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                            <FormLabel className='col-span-2 text-end'>
                              Passport
                            </FormLabel>
                            <FormControl className='col-span-4'>
                              <Input
                                {...fieldProps}
                                type='file'
                                accept='image/png, image/jpeg, image/jpg'
                                onChange={(event) => onChange(event.target.files)}
                              />
                            </FormControl>
                            {photoPreview && (
                              <img
                                src={photoPreview}
                                alt='Passport preview'
                                className='col-span-4 col-start-3 mt-2 h-24 w-24 rounded-md object-cover'
                              />
                            )}
                            <FormMessage className='col-span-4 col-start-3' />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </>
              )}
            </form>
          </Form>
        </div>
        <DialogFooter>
          {currentStep > 0 && !isEdit && (
            <Button variant='outline' onClick={handlePreviousStep}>
              Previous
            </Button>
          )}
          {!isEdit && currentStep < 1 && (
            <Button type='button' onClick={handleNextStep}>
              Next
            </Button>
          )}
          {(isEdit || currentStep === 1) && (
            <Button type='submit' form='user-form' disabled={isLoading}>
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {isEdit
                ? isLoading
                  ? 'Saving...'
                  : 'Save changes'
                : isLoading
                  ? 'Adding...'
                  : `Add ${currentRoleLabel}`}
            </Button>
          )}
        </DialogFooter>
        <p className='mb-4 text-center text-sm text-gray-500'>
          Note: Password is the {currentRoleLabel} Phone number
        </p>
      </DialogContent>
    </Dialog>
  )
}
