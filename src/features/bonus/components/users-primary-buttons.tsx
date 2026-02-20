import { Button } from '@/components/ui/button'
import { useUsers } from './users-provider'

export function UsersPrimaryButtons() {
  const { setOpen, setCurrentRow } = useUsers()

  return (
    <div className='flex gap-2'>
      <Button
        className='space-x-1'
        variant='outline'
        onClick={() => {
          setCurrentRow(null)
          setOpen('reward-config')
        }}
      >
        <span>Configure Rewards</span>
      </Button>
    </div>
  )
}
