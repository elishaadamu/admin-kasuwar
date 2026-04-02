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
import { useAuth } from '@/context/auth-context'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { TeamLeadManagement } from './components/team-lead-management'
import { WalletManagement } from './components/wallet-management'
import { RegionalStatistics } from './components/regional-statistics'
import { type User } from './data/schema'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Trash } from 'lucide-react'
// import { Transactions } from '../transactions'

const route = getRouteApi('/_authenticated/team-members/')

export function TeamMembers() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [geoZones, setGeoZones] = useState<any[]>([])
  const [selectedZone, setSelectedZone] = useState<string>('')
  const [teams, setTeams] = useState<any[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [activeTab, setActiveTab] = useState('managers')
  const [activeSubTab, setActiveSubTab] = useState('assign')
  const [managers, setManagers] = useState<User[]>([])
  const [isManagersLoading, setIsManagersLoading] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const fetchManagers = async () => {
    setIsManagersLoading(true)
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.MANAGERS.GET_ALL) + user?.id,
        { withCredentials: true }
      )
      const allManagers = (response.data?.managers || response.data || []) as any[]
      // Filter for TL and RM specifically
      const filtered = allManagers.filter(
        (m: any) => m.role === 'tl' || m.role === 'rm'
      )
      setManagers(filtered)
    } catch (error) {
      console.error('Failed to fetch managers', error)
    } finally {
      setIsManagersLoading(false)
    }
  }

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
    fetchManagers()
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

  const handleDeleteTeam = async () => {
    if (!selectedTeam) return
    toast.promise(
      axios.delete(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.DELETE_TEAM) + selectedTeam, {
        withCredentials: true
      }),
      {
        loading: 'Deleting team...',
        success: () => {
          setSelectedTeam('')
          if (selectedZone) {
            fetchTeams(selectedZone)
          }
          setIsDeleteDialogOpen(false)
          return 'Team deleted successfully.'
        },
        error: (error: any) => {
          return error.response?.data?.message || 'Failed to delete team.'
        }
      }
    )
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
                <SelectItem value='managers'>Team Members</SelectItem>
                <SelectItem value='wallets'>Wallets</SelectItem>
                <SelectItem value='team-search'>Team Search</SelectItem>
                <SelectItem value='team-assignments'>Team Assignments</SelectItem>
                <SelectItem value='regional-stats'>Regional Stats</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <TabsList className='hidden min-[992px]:flex'>
            <TabsTrigger value='managers'>Team Members</TabsTrigger>
            <TabsTrigger value='wallets'>Wallets</TabsTrigger>
            <TabsTrigger value='team-search'>Team Search</TabsTrigger>
            <TabsTrigger value='team-assignments'>Team Assignments</TabsTrigger>
            <TabsTrigger value='regional-stats'>Regional Stats</TabsTrigger>
          </TabsList>
          <TabsContent value='managers' className='space-y-4'>
            <div className='space-y-4'>
              <div>
                <h3 className='text-lg font-medium'>Regional Managers & Team Leads</h3>
                <p className='text-sm text-muted-foreground'>Direct management personnel.</p>
              </div>
              <UsersTable
                data={managers}
                search={search}
                navigate={navigate}
                isLoading={isManagersLoading}
              />
            </div>
          </TabsContent>

          <TabsContent value='wallets' className='space-y-4'>
            <WalletManagement />
          </TabsContent>

          <TabsContent value='team-search' className='space-y-4'>
            <div className='space-y-4'>
              <div>
                <h3 className='text-lg font-medium'>Team-based Search</h3>
                <p className='text-sm text-muted-foreground'>Filter staff by their assigned zones and teams.</p>
              </div>
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
                
                {selectedTeam && (
                  <div className='w-full sm:w-auto'>
                    <Button 
                      variant="destructive" 
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Delete Team
                    </Button>
                  </div>
                )}
              </div>
              <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
                <UsersTable
                  data={users}
                  search={search}
                  navigate={navigate}
                  isLoading={isLoading}
                />
              </div>
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

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        handleConfirm={handleDeleteTeam}
        title='Delete Team'
        desc={
          <div className="space-y-2">
            <p>
              Are you sure you want to delete this team? This action is permanent and cannot be undone.
            </p>
            <p className="text-destructive text-sm font-medium border border-destructive/20 bg-destructive/10 p-3 rounded-md mt-2">
              Warning: The team members must be removed or reassigned somewhere and the team wallet needs to be empty because both the team and the wallet will be permanently deleted.
            </p>
          </div>
        }
        confirmText='Delete'
        destructive
      />
    </UsersProvider>
  )
}
