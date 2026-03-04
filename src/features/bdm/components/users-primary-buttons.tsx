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
      case 'hr': return 'Add HR'
      default: return 'Add Manager'
    }
  }

  const handleAdd = () => {
    if (activeTab === 'hr') {
      setOpen('add-hr')
    } else {
      setOpen('add')
    }
  }

  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={handleAdd}>
        <span>{getLabel()}</span> <UserPlus size={18} />
      </Button>
    </div>
  )
}
