import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { type PosOrder } from '../data/schema'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: PosOrder
}

function decodeHtml(html: string) {
  return html.replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"')
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-200 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-300',
  pending_payment: 'bg-orange-200 text-orange-900 dark:bg-orange-900/30 dark:text-orange-300',
  submitted: 'bg-blue-200 text-blue-900 dark:bg-blue-900/30 dark:text-blue-300',
  confirmed: 'bg-green-200 text-green-900 dark:bg-green-900/30 dark:text-green-300',
  cancelled: 'bg-red-200 text-red-900 dark:bg-red-900/30 dark:text-red-300',
}

export function PosViewDialog({ open, onOpenChange, currentRow }: Props) {
  if (!currentRow) return null

  const sm = currentRow.salesManager

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            POS Order — {currentRow.uniqueOrderCode}
            <Badge className={cn(STATUS_STYLES[currentRow.status] ?? 'bg-gray-200 text-gray-900')}>
              {currentRow.status.replace(/_/g, ' ')}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4 text-sm'>
          {/* Sales Manager */}
          <section>
            <h4 className='font-semibold mb-1 text-muted-foreground uppercase tracking-wide text-xs'>Sales Manager</h4>
            {sm ? (
              <div className='divide-y rounded-md border'>
                <Row label='Name' value={`${sm.firstName} ${sm.lastName}`} />
                <Row label='Email' value={sm.email} />
                <Row label='Phone' value={sm.phone} />
              </div>
            ) : (
              <p className='text-muted-foreground italic'>No sales manager assigned</p>
            )}
          </section>

          {/* Customer */}
          <section>
            <h4 className='font-semibold mb-1 text-muted-foreground uppercase tracking-wide text-xs'>Customer</h4>
            <div className='divide-y rounded-md border'>
              <Row label='Name' value={currentRow.customerName || 'Guest'} />
              <Row label='Phone' value={currentRow.customerPhone || 'N/A'} />
              <Row label='Address' value={currentRow.deliveryAddress || 'N/A'} />
              <Row label='State' value={currentRow.state || 'N/A'} />
              <Row label='LGA' value={currentRow.lga || 'N/A'} />
            </div>
          </section>

          {/* Products */}
          <section>
            <h4 className='font-semibold mb-1 text-muted-foreground uppercase tracking-wide text-xs'>Products</h4>
            <div className='divide-y rounded-md border'>
              {currentRow.products.map((p) => (
                <div key={p._id} className='flex justify-between px-4 py-2'>
                  <div>
                    <span className='font-medium'>{decodeHtml(p.name)}</span>
                    <span className='text-muted-foreground ml-2'>×{p.quantity}</span>
                  </div>
                  <span className='font-semibold whitespace-nowrap'>
                    {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(p.price * p.quantity)}
                  </span>
                </div>
              ))}
              <div className='flex justify-between px-4 py-2 bg-muted/50 font-semibold'>
                <span>Total</span>
                <span>
                  {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(currentRow.totalAmount)}
                </span>
              </div>
            </div>
          </section>

          {/* Payment & Linked Order */}
          <section>
            <h4 className='font-semibold mb-1 text-muted-foreground uppercase tracking-wide text-xs'>Payment Info</h4>
            <div className='divide-y rounded-md border'>
              <Row label='Payment Status' value={currentRow.paymentStatus} />
              {currentRow.linkedOrder && <Row label='Linked Order ID' value={currentRow.linkedOrder} mono />}
            </div>
          </section>

          {/* Receipt */}
          {currentRow.receipt?.url && (
            <section>
              <h4 className='font-semibold mb-1 text-muted-foreground uppercase tracking-wide text-xs'>Receipt</h4>
              <a
                href={currentRow.receipt.url}
                target='_blank'
                rel='noopener noreferrer'
                className='block'
              >
                <img
                  src={currentRow.receipt.url}
                  alt='POS Receipt'
                  className='rounded-md border max-h-48 w-full object-contain'
                />
              </a>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className='flex justify-between px-4 py-2'>
      <span className='text-muted-foreground'>{label}</span>
      <span className={cn('font-medium text-right max-w-[55%] break-all', mono && 'font-mono text-xs')}>{value}</span>
    </div>
  )
}
