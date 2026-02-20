import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_CONFIG, apiUrl } from '@/config/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, UserPlus, UserCog, Repeat } from 'lucide-react'
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'
import { useUsers } from './users-provider'

interface GeoZone {
  _id: string
  name: string
  code: string
}

interface Team {
  _id: string
  name: string
  state: string
  teamLead?: string
}

interface TeamLeadManagementProps {
  mode: 'assign' | 'lead' | 'reassign'
  onSuccess?: () => void
}

export function TeamLeadManagement({ mode, onSuccess }: TeamLeadManagementProps) {
  const { currentRow } = useUsers()
  const [geoZones, setGeoZones] = useState<GeoZone[]>([])
  const [isLoadingZones, setIsLoadingZones] = useState(false)
  
  const [formData, setFormData] = useState({
    email: currentRow?.email || '',
    role: 'agent',
    zoneId: '',
    teamId: '',
  })
  
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoadingTeams, setIsLoadingTeams] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const roles = [
    { label: 'Agent', value: 'agent' },
    { label: 'User', value: 'user' },
    { label: 'Vendor', value: 'vendor' },
    { label: 'Business Developer (BD)', value: 'bd' },
    { label: 'Business Development Manager (BDM)', value: 'bdm' },
    { label: 'Sales Manager (SM)', value: 'sm' },
  ]

  // Fetch Geopolitical Zones on mount
  useEffect(() => {
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
    fetchGeoZones()
  }, [])

  const fetchTeams = async (zoneId: string) => {
    setIsLoadingTeams(true)
    try {
      const response = await axios.get(
        apiUrl(`${API_CONFIG.ENDPOINTS.REGIONAL.GET_ZONE_TEAMS}${zoneId}/teams`),
        { withCredentials: true }
      )
      setTeams(response.data?.teams || [])
    } catch (error) {
      toast.error('Failed to fetch teams for this zone')
      setTeams([])
    } finally {
      setIsLoadingTeams(false)
    }
  }

  const handleZoneChange = (zoneId: string) => {
    setFormData((prev) => ({ ...prev, zoneId, teamId: '' }))
    if (zoneId) {
      fetchTeams(zoneId)
    } else {
      setTeams([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.zoneId || !formData.teamId) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      if (mode === 'assign') {
        const payload = {
          email: formData.email,
          role: formData.role,
          teamId: formData.teamId,
        }
        await axios.post(
          apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.ASSIGN_MEMBER),
          payload,
          { withCredentials: true }
        )
      } else if (mode === 'reassign') {
        const payload = {
          email: formData.email,
          teamd: formData.teamId,
        }
        await axios.put(
          apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.REASSIGN_MEMBER),
          payload,
          { withCredentials: true }
        )
      } else if (mode === 'lead') {
        const payload = {
          teamId: formData.teamId,
          email: formData.email,
        }
        await axios.put(
          apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.SET_TEAM_LEAD),
          payload,
          { withCredentials: true }
        )
      }

      toast.success(
        mode === 'assign' 
          ? 'Member assigned successfully' 
          : mode === 'reassign' 
          ? 'Assignment updated successfully' 
          : 'Team leader set successfully'
      )
      
      // Reset form
      setFormData({
        email: '',
        role: 'agent',
        zoneId: '',
        teamId: '',
      })
      setTeams([])
      if (onSuccess) onSuccess()
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${mode} member`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTitle = () => {
    if (mode === 'assign') return 'Assign Member'
    if (mode === 'reassign') return 'Reassign Member'
    return 'Set Team Leader'
  }

  const getDescription = () => {
    if (mode === 'assign') return 'Assign a new member to a team'
    if (mode === 'reassign') return 'Move an existing member to a different team'
    return 'Assign a leader to a specific team'
  }

  const getButtonContent = () => {
    if (isSubmitting) return <><Loader2 className='mr-2 h-4 w-4 animate-spin' /> Processing...</>
    if (mode === 'assign') return <><UserPlus className='mr-2 h-4 w-4' /> Assign Member</>
    if (mode === 'reassign') return <><Repeat className='mr-2 h-4 w-4' /> Reassign Member</>
    return <><UserCog className='mr-2 h-4 w-4' /> Set Lead</>
  }

  return (
    <Card className='max-w-2xl'>
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
        <CardDescription>{getDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='flex flex-col space-y-2'>
              <Label htmlFor='email'>Email Address</Label>
              <Input
                className='w-full'
                id='email'
                type='email'
                placeholder='member@example.com'
                required
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>

            {mode === 'assign' && (
              <div className='flex flex-col space-y-2'>
                <Label htmlFor='role'>Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
                >
                  <SelectTrigger id='role' className='w-full'>
                    <SelectValue placeholder='Select Role' />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='flex flex-col space-y-2'>
              <Label htmlFor='zone'>Zone</Label>
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
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='flex flex-col space-y-2'>
              <Label htmlFor='team'>State / Team</Label>
              <Select
                value={formData.teamId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, teamId: value }))}
                disabled={!formData.zoneId || isLoadingTeams}
              >
                <SelectTrigger id='team' className='w-full'>
                  <SelectValue placeholder={isLoadingTeams ? 'Loading...' : 'Select Team'} />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team._id} value={team._id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type='submit' className='w-full sm:w-auto' disabled={isSubmitting}>
            {getButtonContent()}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}





