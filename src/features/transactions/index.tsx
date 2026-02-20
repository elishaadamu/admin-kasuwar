import { useEffect, useState } from 'react'
import axios from 'axios'
import { getRouteApi } from '@tanstack/react-router'
import { API_CONFIG, apiUrl } from '@/config/api'
import { TransactionsTable } from './components/transactions-table'
import { type Transaction } from './data/schema'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

const route = getRouteApi('/_authenticated/transactions/')

export function Transactions() {
  const { page, pageSize } = route.useSearch()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [isStatsLoading, setIsStatsLoading] = useState(false)


  const fetchTransactions = async (page = 1, limit = 50) => {
    setIsLoading(true)
    try {
      const response = await axios.get(
        `${apiUrl(API_CONFIG.ENDPOINTS.TRANSACTIONS.GET_ALL)}?page=${page}&limit=${limit}`,
        { withCredentials: true }
      )
      setTransactions(response.data?.data || [])
    } catch (error) {
      toast.error('Failed to fetch transactions')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    setIsStatsLoading(true)
    try {
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.TRANSACTIONS.ANALYTICS), {
        withCredentials: true,
      })
      setStats(response.data?.data)
    } catch (error) {

    } finally {
      setIsStatsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions(page, pageSize)
    fetchAnalytics()
  }, [page, pageSize])

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <div className='text-2xl font-bold'>{stats?.count || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <div className='text-2xl font-bold'>₦{(stats?.total || 0).toLocaleString()}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Successful</CardTitle>
          </CardHeader>
          <CardContent>
             {isStatsLoading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <div className='text-2xl font-bold text-green-600'>{stats?.successful || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Pending</CardTitle>
          </CardHeader>
          <CardContent>
             {isStatsLoading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <div className='text-2xl font-bold text-yellow-600'>{stats?.pending || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <TransactionsTable data={transactions} isLoading={isLoading} />
    </div>
  )
}
