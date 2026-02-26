// @ts-nocheck
import { useState } from 'react'
import axios from 'axios'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { API_CONFIG, apiUrl } from '@/config/api'
import { UserCheck, UserX, Trash2, Eye, Loader2, BanknoteIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { type User, type UserStatus } from '../data/schema'
import { DebitDialog } from './debit-dialog'
import { TransferDialog } from './transfer-dialog'
import { useUsers } from './users-provider'

type SmRowActionsProps = {
  row: Row<User>
}

export function SmRowActions({ row }: SmRowActionsProps) {
  const { user: authUser } = useAuth()
  const user = row.original
  const { updateUser, removeUser } = useUsers()
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [details, setDetails] = useState<any>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [showDebitDialog, setShowDebitDialog] = useState(false)

  if (!authUser) return null

  const handleStatusChange = async (status: UserStatus) => {
    const isSuspending = status === 'suspended'
    const endpoint = isSuspending
      ? API_CONFIG.ENDPOINTS.SALES_MANAGER.SUSPEND
      : API_CONFIG.ENDPOINTS.SALES_MANAGER.UNSUSPEND

    const prevStatus = user.status
    updateUser(user.id, { status })

    try {
      await toast.promise(
        axios.put(`${apiUrl(endpoint)}${authUser.id}/${user._id || user.id}`),
        {
          loading: `${isSuspending ? 'Suspending' : 'Unsuspending'} sales manager...`,
          success: `Sales manager has been ${isSuspending ? 'suspended' : 'unsuspended'}.`,
          error: 'Failed to update status.',
        }
      )
    } catch (err) {
      updateUser(user.id, { status: prevStatus })
    }
  }

  const handleDelete = async () => {
    try {
      await toast.promise(
        axios.delete(
          `${apiUrl(API_CONFIG.ENDPOINTS.SALES_MANAGER.DELETE)}${authUser.id}/${user._id || user.id}`
        ),
        {
          loading: 'Deleting sales manager...',
          success: () => {
            removeUser(user._id || user.id)
            return 'Sales manager deleted successfully.'
          },
          error: (error) => {
            return error.response?.data?.message || 'Failed to delete sales manager.'
          },
        }
      )
    } catch (err) {
      console.error('Error deleting SM', err)
    }
  }

  const handleViewDetails = async () => {
    setDetailsOpen(true)
    setIsLoadingDetails(true)
    try {
      const response = await axios.get(
        `${apiUrl(API_CONFIG.ENDPOINTS.SALES_MANAGER.GET_SINGLE)}${authUser.id}/${user._id || user.id}`
      )
      console.log('SM Details', response.data)
      setDetails(response.data)
    } catch (err) {
      console.error('Error fetching SM details', err)
      toast.error('Failed to load sales manager details')
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className='flex justify-between gap-4 border-b py-2 last:border-b-0'>
      <span className='shrink-0 font-medium text-muted-foreground'>{label}</span>
      <span className='text-right'>{value ?? '—'}</span>
    </div>
  )

  const sm = details?.Salesmanager || details?.salesmanager
  const wallet = details?.wallet

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
          >
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[180px]'>
          <DropdownMenuItem onClick={handleViewDetails}>
            View Details
            <DropdownMenuShortcut>
              <Eye size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              handleStatusChange(
                user.status === 'suspended' || user.suspended ? 'active' : 'suspended'
              )
            }
          >
            {user.status === 'suspended' || user.suspended ? 'Unsuspend' : 'Suspend'}
            <DropdownMenuShortcut>
              {user.status === 'suspended' || user.suspended ? (
                <UserCheck size={16} />
              ) : (
                <UserX size={16} />
              )}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete}>
            Delete
            <DropdownMenuShortcut>
              <Trash2 size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setShowTransferDialog(true)}>
            Transfer Funds
            <DropdownMenuShortcut>
              <BanknoteIcon size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setShowDebitDialog(true)}>
            Debit Funds
            <DropdownMenuShortcut>
              <BanknoteIcon size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className='sm:max-w-md max-h-[80vh] gap-0 p-0 flex flex-col overflow-hidden'>
          <DialogHeader className='px-4 pt-4 pb-3 shrink-0'>
            <DialogTitle className='text-base'>Sales Manager Details</DialogTitle>
            <DialogDescription className='text-xs'>
              {sm ? `${sm.firstName || ''} ${sm.lastName || ''}`.trim() : user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()}
            </DialogDescription>
          </DialogHeader>
          {isLoadingDetails ? (
            <div className='flex items-center justify-center p-8'>
              <Loader2 className='h-6 w-6 animate-spin text-primary' />
            </div>
          ) : sm ? (
            <ScrollArea className='flex-1 overflow-hidden'>
              <div className='px-4 pb-4 text-sm'>
                {/* Personal Info */}
                <p className='mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>Personal</p>
                <DetailRow label='Name' value={`${sm.firstName || ''} ${sm.middleName || ''} ${sm.lastName || ''}`.replace(/\s+/g, ' ').trim()} />
                <DetailRow label='Email' value={sm.email} />
                <DetailRow label='Phone' value={sm.phone} />
                <DetailRow label='Address' value={sm.address} />
                <DetailRow label='State / LGA' value={`${sm.state || '—'} / ${sm.localGovt || '—'}`} />

                <Separator className='my-2' />
                <p className='mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>Status</p>
                <DetailRow label='Role' value={<Badge variant='outline' className='uppercase text-xs'>{sm.role}</Badge>} />
                <DetailRow label='Business Type' value={<span className='capitalize'>{sm.businessType}</span>} />
                <DetailRow label='Subscription' value={<Badge variant={sm.subscription?.status === 'active' ? 'default' : 'secondary'} className='text-xs'>{sm.subscription?.status || '—'}</Badge>} />
                <DetailRow label='Suspended' value={<Badge variant={sm.suspended ? 'destructive' : 'default'} className='text-xs'>{sm.suspended ? 'Yes' : 'No'}</Badge>} />
                <DetailRow label='NIN' value={<Badge variant={sm.ninStatus === 'verified' ? 'default' : 'secondary'} className='capitalize text-xs'>{sm.ninStatus}</Badge>} />

                <Separator className='my-2' />
                <p className='mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>Bank</p>
                <DetailRow label='Bank' value={sm.bankName} />
                <DetailRow label='Acc No.' value={sm.accNumber} />
                <DetailRow label='Acc Name' value={sm.accName} />

                {wallet && (
                  <>
                    <Separator className='my-2' />
                    <p className='mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>Wallet</p>
                    <DetailRow label='Balance' value={<span className='font-semibold'>{wallet.currency} {Number(wallet.balance).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>} />
                  </>
                )}

                <Separator className='my-2' />
                <p className='mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>Dates</p>
                <DetailRow label='Registered' value={formatDate(sm.registrationDate)} />
                <DetailRow label='Last Login' value={formatDate(sm.lastLogin)} />
              </div>
            </ScrollArea>
          ) : (
            <p className='text-center text-muted-foreground p-4'>No details available.</p>
          )}
        </DialogContent>
      </Dialog>

      <TransferDialog
        managerId={user._id || user.id}
        managerName={user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()}
        open={showTransferDialog}
        onOpenChange={setShowTransferDialog}
      />

      <DebitDialog
        managerId={user._id || user.id}
        managerName={user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()}
        open={showDebitDialog}
        onOpenChange={setShowDebitDialog}
      />
    </div>
  )
}
