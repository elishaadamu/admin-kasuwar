import { useEffect, useState } from 'react'
import axios from 'axios'
import { API_CONFIG, apiUrl } from '@/config/api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type TransactionDetailsDialogProps = {
  transactionId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransactionDetailsDialog({
  transactionId,
  open,
  onOpenChange,
}: TransactionDetailsDialogProps) {
  const [transaction, setTransaction] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open && transactionId) {
      const fetchDetails = async () => {
        setIsLoading(true)
        try {
          const response = await axios.get(
            `${apiUrl(API_CONFIG.ENDPOINTS.TRANSACTIONS.GET_SINGLE)}${transactionId}`,
            { withCredentials: true }
          )
          setTransaction(response.data.data)
        } catch (error) {
          console.error('Failed to fetch transaction details', error)
        } finally {
          setIsLoading(false)
        }
      }
      fetchDetails()
    } else {
      setTransaction(null)
    }
  }, [open, transactionId])

  const walletBalance = typeof transaction?.walletId === 'object' 
    ? transaction.walletId.balance 
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className='flex h-40 items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        ) : transaction ? (
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-2 gap-2 text-sm'>
              <div className='font-medium text-muted-foreground'>User:</div>
              <div className='font-semibold'>
                {transaction.userDetails?.firstName} {transaction.userDetails?.lastName}
              </div>

              <div className='font-medium text-muted-foreground'>Business:</div>
              <div>{transaction.userDetails?.businessName || '-'}</div>

              <div className='font-medium text-muted-foreground'>Reference:</div>
              <div className='font-mono text-xs'>{transaction.reference || transaction._id}</div>

              {walletBalance !== null && (
                <>
                  <div className='font-medium text-muted-foreground'>Wallet Balance:</div>
                  <div className='font-bold text-green-600 font-mono'>₦{walletBalance.toLocaleString()}</div>
                </>
              )}
              
              <div className='font-medium text-muted-foreground'>Type:</div>
              <div className='capitalize font-semibold'>{transaction.type}</div>

              <div className='font-medium text-muted-foreground'>Purpose:</div>
              <div className='capitalize'>{transaction.for?.replace(/_/g, ' ') || '-'}</div>
              
              <div className='font-medium text-muted-foreground'>Amount:</div>
              <div className='font-bold text-lg text-primary'>₦{transaction.amount?.toLocaleString()}</div>
              
              <div className='font-medium text-muted-foreground'>Status:</div>
              <div>
                <Badge variant='outline' className='capitalize'>
                  {transaction.status}
                </Badge>
              </div>
              
              <div className='font-medium text-muted-foreground'>Date:</div>
              <div>{new Date(transaction.createdAt).toLocaleString()}</div>
              
              <div className='font-medium text-muted-foreground'>User Role:</div>
              <div className='capitalize'>{transaction.userRole || '-'}</div>

              <div className='font-medium text-muted-foreground col-span-2 mt-2'>Description:</div>
              <div className='col-span-2 bg-muted p-2 rounded-md italic'>
                {transaction.description || 'No description provided'}
              </div>
            </div>
          </div>
        ) : (
          <div className='py-10 text-center text-muted-foreground'>
            Could not load transaction details.
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
