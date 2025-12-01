// @ts-nocheck

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

export function RecentSales({ data = [] }: RecentSalesProps) {
  return (
    <div className='space-y-8'>
      {data.map((user) => (
        <div key={user._id} className='flex items-center'>
          <div className='flex flex-1 items-center justify-between'>
            <div className='space-y-1'>
              <p className='text-sm leading-none font-medium'>
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.name}
              </p>
              <p className='text-muted-foreground text-sm'>{user.email}</p>
            </div>
            <div className='font-medium'>
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
