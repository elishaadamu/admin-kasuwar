import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUsers } from './users-provider'

export function UsersPrimaryButtons() {
  const { setOpen } = useUsers()
  return (
    <div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto'>
      <Button 
        variant='outline' 
        className='w-full sm:w-auto space-x-2' 
        onClick={() => setOpen('regional-leader')}
      >
        <span>Add Regional Leaders</span> <UserPlus size={18} />
      </Button>
      <Button 
        variant='outline' 
        className='w-full sm:w-auto space-x-2' 
        onClick={() => setOpen('register-staff')}
      >
        <span>Register Staff</span> <UserPlus size={18} />
      </Button>
      <Button 
        variant='default' 
        className='w-full sm:w-auto space-x-2' 
        onClick={() => setOpen('create-team')}
      >
        <span>Create Team</span> <UserPlus size={18} />
      </Button>
    </div>
  )
}