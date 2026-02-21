import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_CONFIG, apiUrl } from '@/config/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, MapPin, Users, Globe, BarChart3, Map } from 'lucide-react'
import { toast } from 'sonner'

interface GeoZone {
  _id: string
  name: string
  code: string
}

interface Subregion {
  _id: string
  name: string
  code: string
  totalMembers: number
  roleBreakdown: Record<string, number>
}

interface RegionDetails {
  _id: string
  name: string
  code: string
  totalMembers: number
  subregions: Subregion[]
}

interface RegionsOverview {
  success: boolean
  totalRegions: number
  totalMembers: number
  regions: Array<{
    _id: string
    name: string
    code: string
    totalMembers: number
  }>
}

export function RegionalStatistics() {
  const [geoZones, setGeoZones] = useState<GeoZone[]>([])
  const [selectedZoneId, setSelectedZoneId] = useState<string>('')
  const [regionDetails, setRegionDetails] = useState<RegionDetails | null>(null)
  const [overview, setOverview] = useState<RegionsOverview | null>(null)
  const [isLoadingZones, setIsLoadingZones] = useState(false)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [isLoadingOverview, setIsLoadingOverview] = useState(false)

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

  // Fetch general regions overview on mount
  useEffect(() => {
    const fetchOverview = async () => {
      setIsLoadingOverview(true)
      try {
        const response = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_REGIONS_STATS),
          { withCredentials: true }
        )
        console.log('Regions Overview', response.data)
        setOverview(response.data)
      } catch (error) {
        toast.error('Failed to fetch regions overview')
      } finally {
        setIsLoadingOverview(false)
      }
    }
    fetchOverview()
  }, [])

  const fetchStats = async (zoneId: string) => {
    setIsLoadingStats(true)
    try {
      const statsRes = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_REGION_STATS) + zoneId + '/details',
        { withCredentials: true }
      )
      console.log("Region Details", statsRes.data)
      setRegionDetails(statsRes.data?.region || null)
    } catch (error) {
      console.log("Error", error)
      toast.error('Failed to fetch regional statistics')
    } finally {
      setIsLoadingStats(false)
    }
  }

  const handleZoneChange = (zoneId: string) => {
    setSelectedZoneId(zoneId)
    if (zoneId) {
      fetchStats(zoneId)
    } else {
      setRegionDetails(null)
    }
  }

  return (
    <div className='space-y-6'>
      {/* General Regions Overview */}
      {isLoadingOverview ? (
        <div className='flex items-center justify-center p-12'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
      ) : overview && (
        <>
          <div>
            <h3 className='flex items-center gap-2 text-lg font-semibold'>
              <Globe className='h-5 w-5' />
              Regions Overview
            </h3>
            <p className='text-sm text-muted-foreground'>
              General statistics across all regions
            </p>
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Total Regions</CardTitle>
                <Map className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{overview.totalRegions || 0}</div>
                <p className='text-xs text-muted-foreground'>Geopolitical zones</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Total Members</CardTitle>
                <Users className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{overview.totalMembers || 0}</div>
                <p className='text-xs text-muted-foreground'>Across all regions</p>
              </CardContent>
            </Card>
          </div>

          {overview.regions && overview.regions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <BarChart3 className='h-5 w-5' />
                  All Regions Breakdown
                </CardTitle>
                <CardDescription>Members distribution across regions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Region</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead className='text-right'>Members</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overview.regions.map((region) => (
                        <TableRow key={region._id}>
                          <TableCell className='font-medium'>{region.name}</TableCell>
                          <TableCell>{region.code}</TableCell>
                          <TableCell className='text-right'>{region.totalMembers}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Zone-Specific Stats */}
      <div className='flex flex-col space-y-2'>
        <label className='text-sm font-medium'>Drill Down by Region (Zone)</label>
        <Select value={selectedZoneId} onValueChange={handleZoneChange}>
          <SelectTrigger className='w-full max-w-sm'>
            <SelectValue placeholder={isLoadingZones ? 'Loading...' : 'Select a zone to view detailed stats'} />
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

      {isLoadingStats ? (
        <div className='flex items-center justify-center p-12'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
      ) : regionDetails ? (
        <>
          {/* Region Summary */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <MapPin className='h-5 w-5' />
                {regionDetails.name} ({regionDetails.code})
              </CardTitle>
              <CardDescription>Detailed breakdown for this region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='flex flex-col space-y-1 rounded-lg border p-4'>
                  <span className='text-xs font-medium text-muted-foreground'>Total Members</span>
                  <span className='text-2xl font-bold'>{regionDetails.totalMembers}</span>
                </div>
                <div className='flex flex-col space-y-1 rounded-lg border p-4'>
                  <span className='text-xs font-medium text-muted-foreground'>Subregions (States)</span>
                  <span className='text-2xl font-bold'>{regionDetails.subregions?.length || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subregions Table */}
          {regionDetails.subregions && regionDetails.subregions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <Users className='h-5 w-5' />
                  Subregions (States)
                </CardTitle>
                <CardDescription>Member distribution and role breakdown per state</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>State</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead className='text-right'>Members</TableHead>
                        <TableHead className='text-right'>Roles</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {regionDetails.subregions.map((sub) => (
                        <TableRow key={sub._id}>
                          <TableCell className='font-medium'>{sub.name}</TableCell>
                          <TableCell>{sub.code}</TableCell>
                          <TableCell className='text-right'>{sub.totalMembers}</TableCell>
                          <TableCell className='text-right'>
                            {Object.keys(sub.roleBreakdown).length > 0 ? (
                              <div className='flex flex-wrap justify-end gap-1'>
                                {Object.entries(sub.roleBreakdown).map(([role, count]) => (
                                  <span
                                    key={role}
                                    className='inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary'
                                  >
                                    {role.toUpperCase()}: {count}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className='text-xs text-muted-foreground'>—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : selectedZoneId ? (
         <div className='flex items-center justify-center p-12 text-muted-foreground'>
           No stats found for this region.
         </div>
      ) : null}
    </div>
  )
}
