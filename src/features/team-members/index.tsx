import { useEffect, useState } from 'react'
import axios from 'axios'
import { getRouteApi } from '@tanstack/react-router'
import { API_CONFIG, apiUrl } from '@/config/api'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { TeamLeadManagement } from './components/team-lead-management'
import { WalletManagement } from './components/wallet-management'
import { RegionalStatistics } from './components/regional-statistics'
import { type User } from './data/schema'
// import { Transactions } from '../transactions'

const route = getRouteApi('/_authenticated/team-members/')

export function TeamMembers() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [geoZones, setGeoZones] = useState<any[]>([])
  const [selectedZone, setSelectedZone] = useState<string>('')
  const [teams, setTeams] = useState<any[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [activeTab, setActiveTab] = useState('wallets')
  const [activeSubTab, setActiveSubTab] = useState('assign')

  const fetchUsers = async (teamId: string) => {
    setIsLoading(true)
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_TEAM_MEMBERS) + teamId,
        {
          withCredentials: true,
        }
      )
      const members = response.data?.members || []
      setUsers(members)
    } catch (error) {
      toast.error('Failed to fetch team members')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchGeoZones = async () => {
    try {
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_ALL_ZONES), {
        withCredentials: true,
      })
      setGeoZones(response.data?.zones || [])
    } catch (error) {
      toast.error('Failed to fetch geo zones')
    }
  }

  const fetchTeams = async (zoneId: string) => {
    try {
      const response = await axios.get(
        apiUrl(`${API_CONFIG.ENDPOINTS.REGIONAL.GET_ZONE_TEAMS}${zoneId}/teams`),
        { withCredentials: true }
      )
      setTeams(response.data?.teams || [])
    } catch (error) {
      toast.error('Failed to fetch teams')
    }
  }

  useEffect(() => {
    fetchGeoZones()
  }, [])

  useEffect(() => {
    if (selectedTeam) {
      fetchUsers(selectedTeam)
    } else {
      setUsers([])
    }
  }, [selectedTeam])

  const handleZoneChange = (zoneId: string) => {
    setSelectedZone(zoneId)
    setSelectedTeam('')
    setTeams([])
    if (zoneId) {
      fetchTeams(zoneId)
    }
  }
  return (
    <UsersProvider
      addUser={(newUser) => setUsers((prev) => [...prev, newUser])}
      removeUser={(id: string) =>
        setUsers((prev) =>
          prev.filter((u) => (u as any)._id !== id && (u as any).id !== id)
        )
      }
      updateUser={(id: string, changes: Partial<User>) =>
        setUsers((prev) =>
          prev.map((u) =>
            (u as any)._id === id || (u as any).id === id
              ? { ...u, ...changes }
              : u
          )
        )
      }
    >
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Team Members
            </h2>
            <p className='text-muted-foreground'>
              Manage team members and their roles here.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-4'>
          <div className='block min-[992px]:hidden'>
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Navigate to...' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='wallets'>Wallets</SelectItem>
                <SelectItem value='managers'>Team Members</SelectItem>
                <SelectItem value='team-assignments'>Team Assignments</SelectItem>
                <SelectItem value='regional-stats'>Regional Stats</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <TabsList className='hidden min-[992px]:flex'>
            <TabsTrigger value='wallets'>Wallets</TabsTrigger>
            <TabsTrigger value='managers'>Team Members</TabsTrigger>
            <TabsTrigger value='team-assignments'>Team Assignments</TabsTrigger>
            <TabsTrigger value='regional-stats'>Regional Stats</TabsTrigger>
          </TabsList>
          <TabsContent value='wallets' className='space-y-4'>
            <WalletManagement />
          </TabsContent>
          <TabsContent value='managers' className='space-y-4'>
            <div className='flex flex-wrap gap-4'>
              <div className='w-full max-w-[200px]'>
                <Select value={selectedZone} onValueChange={handleZoneChange}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select Zone' />
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
              <div className='w-full max-w-[200px]'>
                <Select 
                  value={selectedTeam} 
                  onValueChange={setSelectedTeam}
                  disabled={!selectedZone}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select Team' />
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
            <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
              <UsersTable
                data={users}
                search={search}
                navigate={navigate}
                isLoading={isLoading}
              />
            </div>
          </TabsContent>
          <TabsContent value='team-assignments' className='space-y-4'>
            <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className='w-full'>
              <div className='block min-[992px]:hidden'>
                <Select value={activeSubTab} onValueChange={setActiveSubTab}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Action' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='assign'>Assign</SelectItem>
                    <SelectItem value='reassign'>Reassign</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <TabsList className='hidden min-[992px]:grid w-full max-w-md grid-cols-2'>
                <TabsTrigger value='assign'>Assign</TabsTrigger>
                <TabsTrigger value='reassign'>Reassign</TabsTrigger>
              </TabsList>
              <div className='mt-4'>
                <TabsContent value='assign'>
                  <TeamLeadManagement mode='assign' onSuccess={() => setActiveTab('managers')} />
                </TabsContent>
                <TabsContent value='reassign'>
                  <TeamLeadManagement mode='reassign' onSuccess={() => setActiveTab('managers')} />
                </TabsContent>
               
              </div>
            </Tabs>
          </TabsContent>
          <TabsContent value='regional-stats' className='space-y-4'>
            <RegionalStatistics />
          </TabsContent>
        </Tabs>
      </Main>

      <UsersDialogs onTeamCreated={() => {
        if (selectedZone) {
          fetchTeams(selectedZone)
        }
      }} />
    </UsersProvider>
  )
}
