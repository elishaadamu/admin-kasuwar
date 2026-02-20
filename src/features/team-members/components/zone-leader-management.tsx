import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_CONFIG, apiUrl } from '@/config/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, UserPlus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'

interface Leader {
  firstName: string
  lastName: string
  email: string
  phone: string
}

interface GeoZone {
  _id: string
  name: string
  code: string
  leader?: Leader | null
}

interface ZoneLeaderManagementProps {
  onSuccess?: () => void
}

export function ZoneLeaderManagement({ onSuccess }: ZoneLeaderManagementProps) {
  const [geoZones, setGeoZones] = useState<GeoZone[]>([])
  const [isLoadingZones, setIsLoadingZones] = useState(false)
  const [selectedZone, setSelectedZone] = useState<GeoZone | null>(null)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    zoneId: '',
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch Geopolitical Zones on mount
  const fetchGeoZones = async () => {
    setIsLoadingZones(true)
    try {
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_ALL_ZONES), {
        withCredentials: true,
      })
      setGeoZones(response.data?.zones || [])
    } catch (error) {
      toast.error('Failed to fetch geopolitical zones')
    } finally {
      setIsLoadingZones(false)
    }
  }

  useEffect(() => {
    fetchGeoZones()
  }, [])

  const handleZoneChange = (zoneId: string) => {
    const zone = geoZones.find((z) => z._id === zoneId) || null
    setSelectedZone(zone)
    setFormData({
      zoneId,
      firstName: zone?.leader?.firstName || '',
      lastName: zone?.leader?.lastName || '',
      email: zone?.leader?.email || '',
      phone: zone?.leader?.phone || '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.zoneId) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
      }
      
      const hasLeader = !!selectedZone?.leader

      if (!hasLeader) {
        await axios.post(
          apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.ASSIGN_ZONE_LEADER) + formData.zoneId + '/leader',
          payload,
          { withCredentials: true }
        )
        toast.success('Zone leader assigned successfully')
      } else {
        await axios.put(
          apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.ASSIGN_ZONE_LEADER) + formData.zoneId + '/leader',
          payload,
          { withCredentials: true }
        )
        toast.success('Zone leader updated successfully')
      }

      await fetchGeoZones() // Refresh data
      if (onSuccess) onSuccess()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save zone leader')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!formData.zoneId) return
    
    setIsDeleting(true)
    try {
      await axios.delete(
        apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.ASSIGN_ZONE_LEADER) + formData.zoneId + '/leader',
        { withCredentials: true }
      )
      toast.success('Zone leader removed successfully')
      
      // Reset form and refresh
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        zoneId: '',
      })
      setSelectedZone(null)
      await fetchGeoZones()
      if (onSuccess) onSuccess()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove zone leader')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className='max-w-2xl'>
      <CardHeader>
        <CardTitle>Regional Leader Management</CardTitle>
        <CardDescription>
          Assign, update, or remove a leader for a geopolitical zone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='flex flex-col space-y-2'>
            <Label htmlFor='zone'>Geopolitical Zone</Label>
            <Select
              value={formData.zoneId}
              onValueChange={handleZoneChange}
            >
              <SelectTrigger id='zone' className='w-full'>
                <SelectValue placeholder={isLoadingZones ? 'Loading...' : 'Select Zone'} />
              </SelectTrigger>
              <SelectContent>
                {geoZones.map((zone) => (
                  <SelectItem key={zone._id} value={zone._id}>
                    {zone.name} {zone.leader ? '(Has Leader)' : '(No Leader)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='flex flex-col space-y-2'>
              <Label htmlFor='firstName'>First Name</Label>
              <Input
                id='firstName'
                placeholder='John'
                required
                value={formData.firstName}
                onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div className='flex flex-col space-y-2'>
              <Label htmlFor='lastName'>Last Name</Label>
              <Input
                id='lastName'
                placeholder='Doe'
                required
                value={formData.lastName}
                onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='flex flex-col space-y-2'>
              <Label htmlFor='email'>Email Address</Label>
              <Input
                id='email'
                type='email'
                placeholder='leader@example.com'
                required
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className='flex flex-col space-y-2'>
              <Label htmlFor='phone'>Phone Number</Label>
              <Input
                id='phone'
                placeholder='08012345678'
                required
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>

          <div className='flex flex-wrap gap-4'>
            <Button type='submit' className='min-w-[150px]' disabled={isSubmitting || isDeleting}>
              {isSubmitting ? (
                <><Loader2 className='mr-2 h-4 w-4 animate-spin' /> Processing...</>
              ) : selectedZone?.leader ? (
                <><UserPlus className='mr-2 h-4 w-4' /> Update Leader</>
              ) : (
                <><UserPlus className='mr-2 h-4 w-4' /> Assign Leader</>
              )}
            </Button>

            {selectedZone?.leader && (
              <Button 
                type='button' 
                variant='destructive' 
                onClick={handleDelete}
                disabled={isSubmitting || isDeleting}
              >
                {isDeleting ? (
                  <><Loader2 className='mr-2 h-4 w-4 animate-spin' /> Removing...</>
                ) : (
                  <><Trash2 className='mr-2 h-4 w-4' /> Remove Leader</>
                )}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
