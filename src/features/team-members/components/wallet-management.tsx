import { useEffect, useState } from 'react'
import axios from 'axios'
import { API_CONFIG, apiUrl } from '@/config/api'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, Wallet, Info, ArrowLeftRight } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function WalletManagement() {
  const [regionalWallets, setRegionalWallets] = useState<any[]>([])
  const [selectedZone, setSelectedZone] = useState<string>('')
  const [teamWallets, setTeamWallets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isTeamsLoading, setIsTeamsLoading] = useState(false)
  
  // Details Modals State
  const [selectedDetail, setSelectedDetail] = useState<{ type: 'region' | 'team', data: any } | null>(null)
  const [isDetailsLoading, setIsDetailsLoading] = useState(false)

  const fetchRegionalWallets = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.WALLET.GET_ALL_REGIONAL), {
        withCredentials: true,
      })
      setRegionalWallets(response.data?.wallets || [])
    } catch (error) {
      toast.error('Failed to fetch regional wallets')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTeamWallets = async (zoneId: string) => {
    setIsTeamsLoading(true)
    try {
      const response = await axios.get(apiUrl(`${API_CONFIG.ENDPOINTS.WALLET.GET_ZONE_TEAMS_WALLET}${zoneId}/teams`), {
        withCredentials: true,
      })
      setTeamWallets(response.data?.wallets || [])
    } catch (error) {
      toast.error('Failed to fetch team wallets')
    } finally {
      setIsTeamsLoading(false)
    }
  }

  const fetchDetailedWallet = async (type: 'region' | 'team', id: string) => {
    setIsDetailsLoading(true)
    try {1
      const endpoint = type === 'region' 
        ? `${API_CONFIG.ENDPOINTS.WALLET.GET_ZONE_WALLET}${id}`
        : `${API_CONFIG.ENDPOINTS.WALLET.GET_TEAM_WALLET}${id}`
      
      const response = await axios.get(apiUrl(endpoint), { withCredentials: true })
      setSelectedDetail({ type, data: response.data?.wallet || response.data })
    } catch (error) {
      toast.error(`Failed to fetch ${type} details`)
    } finally {
      setIsDetailsLoading(false)
    }
  }

  useEffect(() => {
    fetchRegionalWallets()
  }, [])

  const handleZoneChange = (zoneId: string) => {
    setSelectedZone(zoneId)
    fetchTeamWallets(zoneId)
  }

  if (isLoading && regionalWallets.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {regionalWallets.map((wallet) => (
          <Card 
            key={wallet._id} 
            className={`transition-all hover:shadow-md cursor-pointer ${selectedZone === wallet.zoneId?._id ? 'border-primary bg-primary/5' : ''}`}
            onClick={() => fetchDetailedWallet('region', wallet.zoneId?._id)}
          >
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {wallet.zoneId?.name || wallet.zoneName || 'Region'} Wallet
              </CardTitle>
              <Info className='h-4 w-4 text-muted-foreground transition-colors hover:text-primary' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                ₦{wallet.balance?.toLocaleString() || '0'}
              </div>
              <p className='text-xs text-muted-foreground'>
                {wallet.currency || 'NGN'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Wallets</CardTitle>
          <CardDescription>
            Select a region to view detailed team wallets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='mb-4 w-full'>
            <Select value={selectedZone} onValueChange={handleZoneChange}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select Region/Zone' />
              </SelectTrigger>
              <SelectContent>
                {regionalWallets.map((wallet) => (
                  <SelectItem key={wallet.zoneId?._id} value={wallet.zoneId?._id}>
                    {wallet.zoneId?.name || wallet.zoneName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedZone ? (
            <div className='space-y-4'>
               {isTeamsLoading ? (
                 <div className="flex items-center justify-center p-8">
                   <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 </div>
               ) : (
                 <div className='rounded-md border'>
                   <Table>
                     <TableHeader>
                       <TableRow>
                         <TableHead>Team Name</TableHead>
                         <TableHead>Balance</TableHead>
                         <TableHead>Currency</TableHead>
                         <TableHead>Last Updated</TableHead>
                         <TableHead className='text-right'>Actions</TableHead>
                       </TableRow>
                     </TableHeader>
                     <TableBody>
                       {teamWallets.length > 0 ? (
                         teamWallets.map((wallet) => (
                           <TableRow key={wallet._id} className='group'>
                             <TableCell className='font-medium'>
                               {wallet.teamId?.name || wallet.teamName}
                             </TableCell>
                             <TableCell>₦{wallet.balance?.toLocaleString()}</TableCell>
                             <TableCell>{wallet.currency}</TableCell>
                             <TableCell>
                               {new Date(wallet.updatedAt).toLocaleDateString()}
                             </TableCell>
                             <TableCell className='text-right'>
                               <Button 
                                 variant='ghost' 
                                 size='sm' 
                                 onClick={() => fetchDetailedWallet('team', wallet.teamId?._id || wallet._id)}
                               >
                                 <Info className='h-4 w-4' />
                                 <span className='ml-2 hidden sm:inline'>Details</span>
                               </Button>
                             </TableCell>
                           </TableRow>
                         ))
                       ) : (
                         <TableRow>
                           <TableCell colSpan={5} className='h-24 text-center'>
                             No team wallets found for this region.
                           </TableCell>
                         </TableRow>
                       )}
                     </TableBody>
                   </Table>
                 </div>
               )}
            </div>
          ) : (
            <div className='py-8 text-center text-muted-foreground'>
              Please select a region to view its team wallets.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={!!selectedDetail} onOpenChange={(open) => !open && setSelectedDetail(null)}>
        <DialogContent className='sm:max-w-xl'>
          {isDetailsLoading ? (
            <div className='flex h-48 items-center justify-center'>
              <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
          ) : selectedDetail && (
            <>
              <DialogHeader>
                <div className='flex items-center gap-3'>
                  <div className='rounded-full bg-primary/10 p-2'>
                    <Wallet className='h-5 w-5 text-primary' />
                  </div>
                  <div>
                    <DialogTitle>
                      {selectedDetail.type === 'region' ? 'Region' : 'Team'} Wallet Details
                    </DialogTitle>
                    <DialogDescription>
                      {selectedDetail.type === 'team' ? (
                        <>Full breakdown for <b>{selectedDetail.data.teamName}</b> located in the {selectedDetail.data.zoneName} region.</>
                      ) : (
                        <>Full breakdown for <b>{selectedDetail.data.zoneName}</b> regional wallet.</>
                      )}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className='grid gap-6 py-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-1 rounded-lg border p-3 bg-muted/30'>
                    <p className='text-xs font-medium text-muted-foreground'>Current Balance</p>
                    <p className='text-xl font-bold'>₦{selectedDetail.data.balance?.toLocaleString() || '0'}</p>
                  </div>
                  <div className='space-y-1 rounded-lg border p-3 bg-muted/30'>
                    <p className='text-xs font-medium text-muted-foreground'>Currency</p>
                    <p className='text-xl font-bold'>{selectedDetail.data.currency || 'NGN'}</p>
                  </div>
                </div>

                <div className='space-y-4'>
                  <h4 className='text-sm font-semibold flex items-center gap-2'>
                    <ArrowLeftRight className='h-4 w-4' />
                    Recent Transactions
                  </h4>
                  <div className='rounded-md border'>
                    <Table>
                      <TableHeader>
                        <TableRow className='bg-muted/50'>
                          <TableHead className='h-9 text-xs'>Type</TableHead>
                          <TableHead className='h-9 text-xs'>Amount</TableHead>
                          <TableHead className='h-9 text-xs'>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedDetail.data.transactions?.length > 0 ? (
                          selectedDetail.data.transactions.slice(0, 5).map((tx: any, i: number) => (
                            <TableRow key={i}>
                              <TableCell className='py-2 text-sm capitalize'>{tx.type}</TableCell>
                              <TableCell className={`py-2 text-sm font-medium ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                {tx.type === 'credit' ? '+' : '-'}₦{tx.amount?.toLocaleString()}
                              </TableCell>
                              <TableCell className='py-2 text-sm text-muted-foreground'>
                                {new Date(tx.date || tx.createdAt).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className='h-16 text-center text-xs text-muted-foreground'>
                              No recent transactions found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className='flex flex-col gap-2 rounded-lg border p-3 bg-primary/5'>
                  <div className='flex justify-between text-xs'>
                    <span className='text-muted-foreground'>ID:</span>
                    <span className='font-mono'>{selectedDetail.data._id}</span>
                  </div>
                  <div className='flex justify-between text-xs'>
                    <span className='text-muted-foreground'>Created:</span>
                    <span>{new Date(selectedDetail.data.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
