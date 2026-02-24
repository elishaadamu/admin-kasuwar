import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { API_CONFIG, apiUrl } from '@/config/api'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { RewardConfigsTable } from './components/reward-configs-table'
import { RewardActivitiesTable } from './components/reward-activities-table'
import { type RewardConfig } from './components/reward-configs-list'
import { type RewardActivity } from './components/reward-activities-columns'

export function Bonus() {
  const [rewardConfigs, setRewardConfigs] = useState<RewardConfig[]>([])
  const [isRewardsLoading, setIsRewardsLoading] = useState(true)
  
  const [rewardActivities, setRewardActivities] = useState<RewardActivity[]>([])
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(false)

  const fetchRewardConfigs = useCallback(async () => {
    setIsRewardsLoading(true)
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.ADMIN.REWARD_CONFIG),
        { withCredentials: true }
      )
     
      // Assuming the API returns an array or an object with a data property
      const data = Array.isArray(response.data) ? response.data : (response.data.data || response.data.configs || [])
      setRewardConfigs(data)
    } catch (error) {
      console.error('Failed to fetch reward configs', error)
    } finally {
      setIsRewardsLoading(false)
    }
  }, [])

  const fetchRewardActivities = useCallback(async () => {
    setIsActivitiesLoading(true)
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.ADMIN.REWARD_ACTIVITIES),
        { withCredentials: true }
      )
      console.log(response.data)
      const data = Array.isArray(response.data) ? response.data : (response.data.data || response.data.activities || [])
      setRewardActivities(data)
    } catch (error) {
      console.error('Failed to fetch reward activities', error)
    } finally {
      setIsActivitiesLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRewardConfigs()
    fetchRewardActivities()
  }, [fetchRewardConfigs, fetchRewardActivities])

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <UsersProvider
        addUser={(newConfig) => setRewardConfigs((prev) => [...prev, newConfig])}
        updateUser={(id, changes) =>
          setRewardConfigs((prev) =>
            prev.map((c) => (c._id === id ? { ...c, ...changes } : c))
          )
        }
      >
        <Main>
          <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>Bonus Management</h2>
              <p className='text-muted-foreground'>Manage reward configurations and monitor activities</p>
            </div>
            <UsersPrimaryButtons />
          </div>

          <Tabs defaultValue="configs" className="space-y-4">
            <TabsList>
              <TabsTrigger value="configs">Configurations</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
            </TabsList>
            
            <TabsContent value="configs" className="space-y-4">
               <RewardConfigsTable data={rewardConfigs} isLoading={isRewardsLoading} />
            </TabsContent>

            <TabsContent value="activities" className="space-y-4">
               <RewardActivitiesTable data={rewardActivities} isLoading={isActivitiesLoading} />
            </TabsContent>
          </Tabs>
        </Main>

        <UsersDialogs />
      </UsersProvider>
    </>
  )
}
