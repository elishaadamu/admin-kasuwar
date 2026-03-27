import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_CONFIG, apiUrl } from '@/config/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'

interface GeoZone {
  _id: string
  name: string
  code: string
}

interface Subregion {
  _id: string
  name: string
  code: string
}

interface CreateTeamManagementProps {
  onSuccess?: () => void
}

export function CreateTeamManagement({ onSuccess }: CreateTeamManagementProps) {
  const [geoZones, setGeoZones] = useState<GeoZone[]>([])
  const [states, setStates] = useState<Subregion[]>([])
  const [isLoadingZones, setIsLoadingZones] = useState(false)
  const [isLoadingStates, setIsLoadingStates] = useState(false)
  const [selectedZoneId, setSelectedZoneId] = useState<string>('')
  const [selectedState, setSelectedState] = useState<string>('')
  const [teamName, setTeamName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  // Fetch States (Subregions) for the selected zone
  const fetchStates = async (zoneId: string) => {
    setIsLoadingStates(true)
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_REGION_STATS) + zoneId + '/details',
        { withCredentials: true }
      )
      setStates(response.data?.region?.subregions || [])
    } catch (error) {
      toast.error('Failed to fetch states for this zone')
    } finally {
      setIsLoadingStates(false)
    }
  }

  useEffect(() => {
    fetchGeoZones()
  }, [])

  const handleZoneChange = (zoneId: string) => {
    setSelectedZoneId(zoneId)
    setSelectedState('')
    setStates([])
    if (zoneId) {
      fetchStates(zoneId)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedZoneId || !selectedState || !teamName.trim()) {
      toast.error('Please fill in all required fields (Zone, State, and Team Name)')
      return
    }

    setIsSubmitting(true)
    try {
      await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.CREATE_TEAM) + selectedZoneId + '/teams',
        { 
          name: teamName.trim(),
          state: selectedState
        },
        { withCredentials: true }
      )
      toast.success('Team created successfully')
      setTeamName('')
      setSelectedState('')
      if (onSuccess) onSuccess()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create team')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='space-y-6'>
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='flex flex-col space-y-2'>
          <Label htmlFor='zone'>Geopolitical Zone</Label>
          <Select
            value={selectedZoneId}
            onValueChange={handleZoneChange}
          >
            <SelectTrigger id='zone' className='w-full'>
              <SelectValue placeholder={isLoadingZones ? 'Loading...' : 'Select Zone'} />
            </SelectTrigger>
            <SelectContent>
              {geoZones.map((zone) => (
                <SelectItem key={zone._id} value={zone._id}>
                  {zone.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex flex-col space-y-2'>
          <Label htmlFor='state'>Team</Label>
          <Select
            value={selectedState}
            onValueChange={setSelectedState}
            disabled={!selectedZoneId || isLoadingStates}
          >
            <SelectTrigger id='state' className='w-full'>
              <SelectValue placeholder={isLoadingStates ? 'Loading...' : 'Select State'} />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state._id} value={state.name}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex flex-col space-y-2'>
          <Label htmlFor='teamName'>Team Name</Label>
          <Input
            id='teamName'
            placeholder='e.g. Northern Eagles'
            required
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />
        </div>

        <Button type='submit' className='w-full' disabled={isSubmitting}>
          {isSubmitting ? (
            <><Loader2 className='mr-2 h-4 w-4 animate-spin' /> Creating...</>
          ) : (
            <><Users className='mr-2 h-4 w-4' /> Create Team</>
          )}
        </Button>
      </form>
    </div>
  )
}

