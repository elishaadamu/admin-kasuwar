import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import { toast } from 'sonner'
import { Loader2, Upload, UserPlus } from 'lucide-react'
import { API_CONFIG, apiUrl } from '@/config/api'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import statesData from '@/features/products/data/states.json'
import lgaData from '@/stores/lga.json'

const formSchema = z.object({
  // Deployment Setup
  role: z.enum(['bd', 'bdm', 'sm', 'tl', 'rm']),
  regionalId: z.string().optional(),
  teamId: z.string().optional(),
  isTeamLead: z.boolean().default(false),
  isRegionalLeader: z.boolean().default(false),

  // Personal Information
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  gender: z.enum(['male', 'female']),
  maritalStatus: z.string().min(1, 'Marital status is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  address: z.string().min(5, 'Address is required'),
  localGovt: z.string().min(1, 'Local government is required'),
  state: z.string().min(1, 'State is required'),

  // Financial Details
  accountName: z.string().min(2, 'Account name is required'),
  accountNumber: z.string().min(10, 'Account number is required').max(10),
  bankName: z.string().min(2, 'Bank name is required'),

  // Documents
  validId: z.string().min(1, 'Valid ID number is required'),
  passportPhoto: z.string().optional(),

  // Security
  password: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface RegisterStaffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RegisterStaffDialog({ open, onOpenChange }: RegisterStaffDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [regions, setRegions] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      role: 'bd',
      isTeamLead: false,
      isRegionalLeader: false,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      gender: 'male',
      maritalStatus: 'single',
      dateOfBirth: '',
      address: '',
      localGovt: '',
      state: '',
      accountName: '',
      accountNumber: '',
      bankName: '',
      validId: '',
      passportPhoto: '',
      password: '',
    },
  })

  const [availableLgas, setAvailableLgas] = useState<string[]>([])
  
  const selectedRegion = form.watch('regionalId')
  const selectedState = form.watch('state')
  const isRegionalLeader = form.watch('isRegionalLeader')
  const isTeamLead = form.watch('isTeamLead')
  const showDeployment = isRegionalLeader || isTeamLead

  // Update LGAs when state changes
  useEffect(() => {
    if (selectedState && (lgaData as any)[selectedState]) {
      setAvailableLgas((lgaData as any)[selectedState])
      // Reset localGovt if it's not in the new state's LGAs
      const currentLga = form.getValues('localGovt')
      if (currentLga && !(lgaData as any)[selectedState].includes(currentLga)) {
        form.setValue('localGovt', '')
      }
    } else {
      setAvailableLgas([])
      form.setValue('localGovt', '')
    }
  }, [selectedState, form])

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_ALL_ZONES), {
          withCredentials: true,
        })
        setRegions(response.data?.zones || [])
      } catch (error) {
        console.error('Failed to fetch regions', error)
      }
    }
    if (open) {
      fetchRegions()
    }
  }, [open])

  useEffect(() => {
    const fetchTeams = async () => {
      if (!selectedRegion) {
        setTeams([])
        return
      }
      try {
        const response = await axios.get(
          apiUrl(`${API_CONFIG.ENDPOINTS.REGIONAL.GET_ZONE_TEAMS}${selectedRegion}/teams`),
          { withCredentials: true }
        )
        setTeams(response.data?.teams || [])
      } catch (error) {
        console.error('Failed to fetch teams', error)
      }
    }
    fetchTeams()
  }, [selectedRegion])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'passportPhoto') => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Limit dimensions for better compression
        const MAX_WIDTH = 400
        const MAX_HEIGHT = 400
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        // Compress to JPEG with quality adjustments to stay under ~50KB
        // Base64 of 50kb is roughly 68000 characters
        let quality = 0.7
        let base64 = canvas.toDataURL('image/jpeg', quality)
        
        while (base64.length > 68000 && quality > 0.1) {
          quality -= 0.1
          base64 = canvas.toDataURL('image/jpeg', quality)
        }

        form.setValue(fieldName, base64)
        toast.success(`Passport photo compressed to ${Math.round(base64.length / 1024)}KB and selected`)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data: FormValues) => {
    console.log('Registering staff payload (Base64 JSON):', data)
    setIsLoading(true)

    try {
      await axios.post(apiUrl(API_CONFIG.ENDPOINTS.HR.REGISTER_STAFF), data, {
        withCredentials: true,
      })
      toast.success('Staff registered successfully')
      form.reset()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to register staff')
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[700px] max-h-[90vh] p-0'>
        <DialogHeader className='px-6 pt-6'>
          <DialogTitle>Register New Staff Member</DialogTitle>
          <DialogDescription>
            Onboard new staff and assign them to regions and teams.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <ScrollArea className='px-6 pb-6 max-h-[calc(90vh-140px)]'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8 pt-4'>
              {/* Deployment Setup */}
              <div className='space-y-4'>
                <h3 className='text-sm font-medium text-primary'>Deployment Setup</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='role'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue placeholder='Select role' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='bd'>Business Developer (BD)</SelectItem>
                            <SelectItem value='bdm'>Business Development Manager (BDM)</SelectItem>
                            <SelectItem value='sm'>Sales Manager (SM)</SelectItem>
                            <SelectItem value='tl'>Team Lead (TL)</SelectItem>
                            <SelectItem value='rm'>Regional Manager (RM)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {showDeployment && (
                    <>
                      <FormField
                        control={form.control}
                        name='regionalId'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Region</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                              <FormControl>
                                <SelectTrigger className='w-full'>
                                  <SelectValue placeholder='Select region' />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {regions.map((region) => (
                                  <SelectItem key={region._id} value={region._id}>
                                    {region.name}
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
                        name='teamId'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Team</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value as string}
                              disabled={!selectedRegion}
                            >
                              <FormControl>
                                <SelectTrigger className='w-full'>
                                  <SelectValue placeholder='Select team' />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {teams.map((team) => (
                                  <SelectItem key={team._id} value={team._id}>
                                    {team.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <div className='flex flex-col space-y-4 justify-center pt-2'>
                    <FormField
                      control={form.control}
                      name='isTeamLead'
                      render={({ field }) => (
                        <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3'>
                          <FormControl>
                            <Checkbox
                              checked={field.value as boolean}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className='space-y-1 leading-none'>
                            <FormLabel>Team Lead</FormLabel>
                            <FormDescription>Mark as a team leader</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='isRegionalLeader'
                      render={({ field }) => (
                        <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3'>
                          <FormControl>
                            <Checkbox
                              checked={field.value as boolean}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className='space-y-1 leading-none'>
                            <FormLabel>Regional Leader</FormLabel>
                            <FormDescription>Mark as a regional leader</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Personal Information */}
              <div className='space-y-4'>
                <h3 className='text-sm font-medium text-primary'>Personal Information</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='firstName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input className='w-full' placeholder='John' {...field} value={field.value as string} />
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
                          <Input className='w-full' placeholder='Doe' {...field} value={field.value as string} />
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
                          <Input className='w-full' placeholder='john.doe@example.com' {...field} value={field.value as string} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='phone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input className='w-full' placeholder='08012345678' {...field} value={field.value as string} />
                        </FormControl>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue placeholder='Select gender' />
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
                        <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue placeholder='Select status' />
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
                  <FormField
                    control={form.control}
                    name='dateOfBirth'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input className='w-full' type='date' {...field} value={field.value as string} />
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
                        <FormLabel>State of Residence</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue placeholder='Select state' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {statesData.states.map((state) => (
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
                        <FormLabel>Local Govt</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value as string}
                          disabled={!selectedState}
                        >
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue placeholder='Select LGA' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableLgas.map((lga) => (
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
                  <FormField
                    control={form.control}
                    name='address'
                    render={({ field }) => (
                      <FormItem className='md:col-span-2'>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input className='w-full' placeholder='123 Main St, Area' {...field} value={field.value as string} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Financial Details */}
              <div className='space-y-4'>
                <h3 className='text-sm font-medium text-primary'>Financial Details</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='bankName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input className='w-full' placeholder='e.g. GTBank' {...field} value={field.value as string} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='accountNumber'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input className='w-full' placeholder='0123456789' {...field} maxLength={10} value={field.value as string} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='accountName'
                    render={({ field }) => (
                      <FormItem className='md:col-span-2'>
                        <FormLabel>Account Name</FormLabel>
                        <FormControl>
                          <Input className='w-full' placeholder='JOHN DOE' {...field} value={field.value as string} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Documents & Security */}
              <div className='space-y-4'>
                <h3 className='text-sm font-medium text-primary'>Documents & Security</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>


                  <div className='space-y-4 md:col-span-2'>
                    <FormField
                      control={form.control}
                      name='validId'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valid ID Number</FormLabel>
                          <FormControl>
                            <Input className='w-full' placeholder='Enter ID number' {...field} value={field.value as string} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className='md:col-span-2 space-y-3'>
                    <FormLabel>Passport Photo</FormLabel>
                    <div className='flex flex-col gap-4'>
                      <Input
                        type='file'
                        accept='image/*'
                        className='hidden'
                        id='passport-upload'
                        onChange={(e) => handleFileUpload(e, 'passportPhoto')}
                      />
                      <Button
                        type='button'
                        variant='outline'
                        className='w-full h-20 border-dashed border-2 flex flex-col gap-2 p-4'
                        onClick={() => document.getElementById('passport-upload')?.click()}
                      >
                        <Upload className='h-5 w-5 text-muted-foreground' />
                        <span className='text-xs font-medium text-muted-foreground'>Choose a professional passport photo</span>
                      </Button>
                      
                      {form.watch('passportPhoto') && (
                        <div className='relative w-48 h-48 mx-auto rounded-2xl overflow-hidden border-4 border-white shadow-xl group bg-muted'>
                          <img 
                            src={form.watch('passportPhoto')} 
                            alt='Passport Preview' 
                            className='h-full w-full object-cover' 
                          />
                          <div className='absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]'>
                            <p className='text-white text-[10px] font-black uppercase tracking-widest'>Passport Preview</p>
                            <span className='text-white/70 text-[9px] mt-1'>Click button to change</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name='password'
                    render={({ field }) => (
                      <FormItem className='md:col-span-2'>
                        <FormLabel>Password (Optional)</FormLabel>
                        <FormControl>
                          <Input className='w-full' type='password' placeholder='Leave blank to use phone number' {...field} value={field.value as string} />
                        </FormControl>
                        <FormDescription>
                          Defaults to phone number if left blank.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className='flex justify-end gap-3 pt-4'>
                <Button variant='outline' type='button' onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type='submit' disabled={isLoading}>
                  {isLoading ? (
                    <><Loader2 className='mr-2 h-4 w-4 animate-spin' /> Registering...</>
                  ) : (
                    <><UserPlus className='mr-2 h-4 w-4' /> Register Staff</>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
