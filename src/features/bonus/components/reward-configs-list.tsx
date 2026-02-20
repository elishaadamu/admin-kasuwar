import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export interface RewardConfig {
  _id: string
  name: string
  event: string
  regionAmount: number
  teamAmount: number
  enabled: boolean
  createdAt: string
  updatedAt: string
}

interface RewardConfigsListProps {
  data: RewardConfig[]
  isLoading: boolean
}

export function RewardConfigsList({ data, isLoading }: RewardConfigsListProps) {
  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <Skeleton className='h-4 w-[100px]' />
              <Skeleton className='h-4 w-[80px]' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-8 w-[120px] mb-2' />
              <Skeleton className='h-4 w-[100px]' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data?.length) {
    return (
      <div className='flex h-[400px] flex-col items-center justify-center rounded-md border border-dashed text-center animate-in fade-in-50'>
        <div className='mx-auto flex max-w-[420px] flex-col items-center justify-center text-center'>
            <h3 className='mt-4 text-lg font-semibold'>No configurations found</h3>
            <p className='mb-4 mt-2 text-sm text-muted-foreground'>
                You haven't configured any rewards yet.
            </p>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount)
  }

  const formatEventName = (event: string) => {
    return event.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {data.map((config) => (
        <Card key={config._id} className='transition-all hover:shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {config.name}
            </CardTitle>
            <Badge variant='outline' className='capitalize'>
              {formatEventName(config.event)}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{formatCurrency(config.regionAmount)}</div>
            <p className='text-xs text-muted-foreground'>
              Region Bonus
            </p>
            <div className='mt-4 text-xl font-semibold'>{formatCurrency(config.teamAmount)}</div>
             <p className='text-xs text-muted-foreground'>
              Team Bonus
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
