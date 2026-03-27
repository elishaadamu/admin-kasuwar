import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUsers } from './users-provider'

export function UsersPrimaryButtons() {
  const { setOpen } = useUsers()
  return (
    <div className='flex gap-2'>
      <Button variant='outline' className='space-x-1' onClick={() => setOpen('regional-leader')}>
        <span>Add Regional Leaders</span> <UserPlus size={18} />
      </Button>
      <Button variant='default' className='space-x-1' onClick={() => setOpen('create-team')}>
        <span>Create Team</span> <UserPlus size={18} />
      </Button>
    </div>
  )
}