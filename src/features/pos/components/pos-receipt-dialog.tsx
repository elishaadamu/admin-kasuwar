import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type PosOrder } from '../data/schema'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: PosOrder
}

export function PosReceiptDialog({ open, onOpenChange, currentRow }: Props) {
  if (!currentRow?.receipt?.url) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>
            Receipt — {currentRow.uniqueOrderCode}
          </DialogTitle>
        </DialogHeader>
        <div className='flex items-center justify-center rounded-md border bg-muted/30 p-2'>
          <img
            src={currentRow.receipt.url}
            alt={`Receipt for order ${currentRow.uniqueOrderCode}`}
            className='max-h-[65vh] w-full rounded-md object-contain'
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
