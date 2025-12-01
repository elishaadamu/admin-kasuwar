import { useState } from 'react'
import { Loader2, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUsers } from './users-provider'

export function UsersPrimaryButtons() {
  const { setOpen } = useUsers()
  const [isLoading] = useState(false)

  return (
    <div className='flex gap-2'>
      <Button
        className='space-x-1'
        onClick={() => setOpen('add')}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
        ) : (
          <PlusCircle size={18} className='mr-2' />
        )}
        <span>{isLoading ? 'Adding Coupon...' : 'Add Coupon'}</span>
      </Button>
    </div>
  )
}
