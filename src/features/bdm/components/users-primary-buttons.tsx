import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUsers } from './users-provider'

interface UsersPrimaryButtonsProps {
  activeTab?: string
}

export function UsersPrimaryButtons({ activeTab = 'bdm' }: UsersPrimaryButtonsProps) {
  const { setOpen } = useUsers()

  const getLabel = () => {
    switch (activeTab) {
      case 'sm': return 'Add Sales Manager'
      case 'bd/bdm': return 'Add BD/BDM'
      default: return 'Add Manager'
    }
  }

  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>{getLabel()}</span> <UserPlus size={18} />
      </Button>
    </div>
  )
}
