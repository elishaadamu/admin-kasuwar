import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_CONFIG, apiUrl } from '@/config/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, Package, ShoppingCart, Truck, MapPin, Users } from 'lucide-react'
import { toast } from 'sonner'

interface GeoZone {
  _id: string
  name: string
  code: string
}

interface RegionalMetrics {
  totalProducts: number
  totalOrders: number
  totalDeliveryRequests: number
}

interface SubregionMetrics {
  teamId: string
  teamName: string
  teamCode: string
  totalProducts: number
  totalOrders: number
  totalDeliveryRequests: number
}

export function RegionalStatistics() {
  const [geoZones, setGeoZones] = useState<GeoZone[]>([])
  const [selectedZoneId, setSelectedZoneId] = useState<string>('')
  const [metrics, setMetrics] = useState<RegionalMetrics | null>(null)
  const [subregions, setSubregions] = useState<SubregionMetrics[]>([])
  const [details, setDetails] = useState<any>(null)
  const [isLoadingZones, setIsLoadingZones] = useState(false)
  const [isLoadingStats, setIsLoadingStats] = useState(false)

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

  const fetchStats = async (zoneId: string) => {
    setIsLoadingStats(true)
    try {
      // Fetch metrics
      const metricsRes = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_ZONE_METRICS) + zoneId + '/metrics',
        { withCredentials: true }
      )
      console.log("Metrics", metricsRes.data)
      setMetrics(metricsRes.data.metrics)
      setSubregions(metricsRes.data.subregions || [])

      // Fetch detailed stats
      const statsRes = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_REGION_STATS) + zoneId + '/details',
        { withCredentials: true }
      )
      console.log("Details", statsRes.data)
      setDetails(statsRes.data?.stats || statsRes.data)
    } catch (error) {
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
      setMetrics(null)
      setSubregions([])
      setDetails(null)
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col space-y-2'>
        <label className='text-sm font-medium'>Select Region (Zone)</label>
        <Select value={selectedZoneId} onValueChange={handleZoneChange}>
          <SelectTrigger className='w-full max-w-sm'>
            <SelectValue placeholder={isLoadingZones ? 'Loading...' : 'Select a zone to view stats'} />
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
      ) : metrics ? (
        <>
          <div className='grid gap-4 sm:grid-cols-3'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Total Products</CardTitle>
                <Package className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{metrics.totalProducts || 0}</div>
                <p className='text-xs text-muted-foreground'>Available in this region</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Total Orders</CardTitle>
                <ShoppingCart className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{metrics.totalOrders || 0}</div>
                <p className='text-xs text-muted-foreground'>Placed within this region</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Delivery Requests</CardTitle>
                <Truck className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{metrics.totalDeliveryRequests || 0}</div>
                <p className='text-xs text-muted-foreground'>Active deliveries in region</p>
              </CardContent>
            </Card>
          </div>

          {subregions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <Users className='h-5 w-5' />
                  Subregions Performance (Teams)
                </CardTitle>
                <CardDescription>Breakdown of activity across teams in this zone</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Team Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead className='text-right'>Products</TableHead>
                        <TableHead className='text-right'>Orders</TableHead>
                        <TableHead className='text-right'>Deliveries</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subregions.map((team) => (
                        <TableRow key={team.teamId}>
                          <TableCell className='font-medium'>{team.teamName}</TableCell>
                          <TableCell>{team.teamCode}</TableCell>
                          <TableCell className='text-right'>{team.totalProducts}</TableCell>
                          <TableCell className='text-right'>{team.totalOrders}</TableCell>
                          <TableCell className='text-right'>{team.totalDeliveryRequests}</TableCell>
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
      ) : (
        <div className='flex items-center justify-center p-12 text-muted-foreground'>
          Please select a region to view detailed metrics and statistics.
        </div>
      )}

      {details && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <MapPin className='h-5 w-5' />
              Detailed Regional Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              {Object.entries(details).map(([key, value]) => {
                // Formatting key from camelCase to Title Case
                const label = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase())
                
                if (typeof value === 'object') return null

                return (
                  <div key={key} className='flex flex-col space-y-1 rounded-lg border p-3'>
                    <span className='text-xs font-medium text-muted-foreground'>{label}</span>
                    <span className='text-lg font-bold'>{String(value)}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
