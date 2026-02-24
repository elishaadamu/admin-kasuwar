import { useState } from 'react'
import axios from 'axios'
import { API_CONFIG, apiUrl } from '@/config/api'
import { toast } from 'sonner'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type TransferDialogProps = {
  managerId: string
  managerName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransferDialog({
  managerId,
  managerName,
  open,
  onOpenChange,
}: TransferDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
  })
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    try {
      const payload = {
        managerId,
        amount: Number(formData.amount),
        description: formData.description,
      }
     
      await toast.promise(
        axios.post(
          `${apiUrl(API_CONFIG.ENDPOINTS.ADMIN.TRANSFER)}${user.id}`,
          payload
        ),
        {
          loading: 'Processing transfer...',
          success: () => {
          
            return 'Transfer completed successfully.'
          },
          error: (err) => {
            return err.response?.data?.message || 'Failed to process transfer.'
          },
        }
      )
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Transfer Funds</DialogTitle>
          <DialogDescription>
            Enter the transfer details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='managerId'>Manager</Label>
              <Input
                id='managerId'
                value={managerName}
                disabled
                className='bg-muted'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='amount'>Amount</Label>
              <Input
                id='amount'
                type='number'
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder='Enter transfer description...'
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Transfer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
