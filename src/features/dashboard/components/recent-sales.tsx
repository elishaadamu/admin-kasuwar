// @ts-nocheck

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface User {
  _id: string
  firstName?: string
  lastName?: string
  name?: string
  email?: string
  passportPhoto?: string
  walletBalance?: number
}

interface RecentSalesProps {
  data?: User[]
}

const shortenEmail = (email?: string) => {
  if (!email) return ''
  if (email.length <= 22) return email
  const [localPart, domain] = email.split('@')
  if (!domain) return email.substring(0, 19) + '...'
  return `${localPart.substring(0, Math.min(localPart.length, 8))}...@${domain}`
}

export function RecentSales({ data = [] }: RecentSalesProps) {
  return (
    <div className='space-y-8'>
      {data.map((user) => (
        <div key={user._id} className='flex items-center'>
          <div className='flex flex-1 items-center justify-between overflow-hidden'>
            <div className='space-y-1 overflow-hidden pr-2'>
              <p className='text-sm leading-none font-medium truncate'>
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.name || 'Unnamed User'}
              </p>
              {user.email && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className='text-muted-foreground text-sm cursor-help truncate'>
                      {shortenEmail(user.email)}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    <p>{user.email}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <div className='font-medium shrink-0'>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'ngn',
              }).format(user.walletBalance || 0)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

