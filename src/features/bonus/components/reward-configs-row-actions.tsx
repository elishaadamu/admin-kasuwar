import { Row } from '@tanstack/react-table'
import { MoreHorizontal, SquarePen, Power, PowerOff } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import { API_CONFIG, apiUrl } from '@/config/api'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { RewardConfig } from './reward-configs-list'
import { useUsers } from './users-provider'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function RewardConfigRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const { setOpen, setCurrentRow, updateUser } = useUsers()
  const rewardConfig = row.original as RewardConfig

  const toggleStatus = async () => {
    try {
      const response = await axios.put(
        `${apiUrl(API_CONFIG.ENDPOINTS.ADMIN.REWARD_CONFIG_STATUS)}/${rewardConfig._id}/status`,
        {},
        { withCredentials: true }
      )
      updateUser(rewardConfig._id, response.data)
      toast.success(`Reward configuration ${rewardConfig.enabled ? 'disabled' : 'enabled'} successfully!`)
    } catch (error: any) {
      console.error(error)
      const errorMessage = error.response?.data?.message || 'Failed to update status.'
      toast.error(errorMessage)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <span className='sr-only'>Open menu</span>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(rewardConfig)
            setOpen('reward-config')
          }}
        >
          <SquarePen className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={toggleStatus}>
          {rewardConfig.enabled ? (
            <>
              <PowerOff className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
              Disable
            </>
          ) : (
            <>
              <Power className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
              Enable
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
