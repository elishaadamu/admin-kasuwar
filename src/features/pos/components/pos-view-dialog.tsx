// @ts-nocheck
'use client'

import {
  Download,
  Package,
  User as UserIcon,
  Store,
  MapPin,
  CreditCard,
  ShoppingBag,
  Tag,
  Hash,
  Phone,
  Mail,
  Receipt,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
  Briefcase
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { type PosOrder } from '../data/schema'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: PosOrder | any
}

function decodeHtml(html?: string) {
  if (!html) return ''
  return html.replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"')
}

export function PosViewDialog({ open, onOpenChange, currentRow }: Props) {
  if (!currentRow) return null

  const order = currentRow

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount)
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusConfig = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'verified':
        return { label: 'Confirmed', bg: 'bg-emerald-500/15', text: 'text-emerald-600', border: 'border-emerald-500/30', dot: 'bg-emerald-500' }
      case 'submitted':
        return { label: 'Submitted', bg: 'bg-blue-500/15', text: 'text-blue-600', border: 'border-blue-500/30', dot: 'bg-blue-500' }
      case 'pending':
      case 'pending_payment':
      case 'pending payment':
        return { label: status.replace(/_/g, ' '), bg: 'bg-amber-500/15', text: 'text-amber-600', border: 'border-amber-500/30', dot: 'bg-amber-500' }
      case 'cancelled':
        return { label: 'Cancelled', bg: 'bg-red-500/15', text: 'text-red-600', border: 'border-red-500/30', dot: 'bg-red-500' }
      default:
        return { label: status?.replace(/_/g, ' ') || 'Unknown', bg: 'bg-gray-500/15', text: 'text-gray-600', border: 'border-gray-500/30', dot: 'bg-gray-500' }
    }
  }

  const statusConfig = getStatusConfig(order?.status)
  const paymentStatusConfig = getStatusConfig(order?.paymentStatus)

  const handlePrintSlip = () => {
    window.print()
  }

  const sm = order?.salesManager

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='h-[92vh] overflow-y-auto sm:max-w-4xl flex flex-col p-0'>
        {/* ── Header ── */}
        <div className="border-b bg-slate-50/50 dark:bg-slate-900/40 px-6 py-5 rounded-t-lg backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-500/10">
                  <Receipt className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                POS Order Details
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-muted-foreground text-sm">Code:</span>
                <span className="font-mono bg-indigo-100/50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/50 px-2.5 py-0.5 rounded text-indigo-700 dark:text-indigo-300 text-sm font-bold tracking-widest">
                  {order?.uniqueOrderCode || 'N/A'}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 pr-6 sm:pr-8">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                <span className={`h-2 w-2 rounded-full ${statusConfig.dot} animate-pulse`} />
                Order: {statusConfig.label}
              </span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${paymentStatusConfig.bg} ${paymentStatusConfig.text} ${paymentStatusConfig.border}`}>
                Pay: {paymentStatusConfig.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 text-muted-foreground text-xs">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-indigo-500/70" />
              {formatDate(order?.createdAt)}
            </span>
            {order?.verification?.verifiedAt && (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verified: {formatDate(order?.verification?.verifiedAt)}
              </span>
            )}
          </div>
        </div>

        <div className='flex-1 space-y-6 text-sm text-foreground px-6 py-5'>
          {/* ── Order Items ── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-indigo-500/10">
                <ShoppingBag className="h-4 w-4 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-sm">Order Items</h3>
              <Badge variant="secondary" className="ml-auto text-[10px]">
                {order?.products?.length || 0} item{(order?.products?.length || 0) !== 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="rounded-xl border overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/30 border-b">
                    <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-12">Img</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Product</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground text-center">Qty</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Price</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order?.products?.map((p: any, i: number) => {
                    const productObj = typeof p.productId === 'object' ? p.productId : null;
                    const imageUrl = productObj?.images?.[0]?.url;
                    return (
                      <tr key={p._id || i} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          {imageUrl ? (
                            <img src={imageUrl} alt={p.name} className="h-10 w-10 min-w-[2.5rem] rounded-md object-cover border" />
                          ) : (
                            <div className="flex items-center justify-center h-10 w-10 min-w-[2.5rem] rounded-md bg-muted border">
                              <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-medium">{decodeHtml(p.name)}</span>
                            {productObj?.addedBy === 'vendor' && (
                              <span className="text-[10px] text-orange-600 dark:text-orange-400 mt-0.5 inline-flex items-center gap-1">
                                <Store className="h-2.5 w-2.5" /> Vendor Product
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                            {p.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{formatCurrency(p.price || 0)}</td>
                        <td className="px-4 py-3 text-right font-semibold">{formatCurrency((p.price || 0) * (p.quantity || 1))}</td>
                      </tr>
                    )
                  })}
                  {(!order?.products || order.products.length === 0) && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-muted-foreground">No items found in this order.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Payment & Pricing ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Payment Details */}
            <div className="rounded-xl border p-4 space-y-3 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20 dark:to-transparent flex flex-col justify-center">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200 dark:border-emerald-900/50">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-emerald-500/10">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Payment Info</h4>
                </div>
                {order?.linkedOrder && (
                  <Badge variant="outline" className="border-emerald-300 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 font-mono text-[10px]">
                    Linked: {order.linkedOrder.slice(-6).toUpperCase()}
                  </Badge>
                )}
              </div>
              <div className="space-y-3 w-full">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Sale Type</span>
                  <span className="font-semibold text-xs bg-muted px-2 py-0.5 rounded-md">POS Transaction</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Payment Status</span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize border ${paymentStatusConfig.bg} ${paymentStatusConfig.text} ${paymentStatusConfig.border}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${paymentStatusConfig.dot}`} />
                    {paymentStatusConfig.label}
                  </span>
                </div>
                <Separator className="bg-emerald-200/50 dark:bg-emerald-800/30" />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm font-medium">Verify Status</span>
                  {order?.verification?.verifiedAt ? (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 flex items-center gap-1">
                       Pending Verification
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="rounded-xl border bg-gradient-to-br from-slate-50 via-white to-indigo-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 p-4 shadow-sm space-y-2.5 flex flex-col justify-center">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order Amount:</span>
                <span className="font-medium">{formatCurrency(order?.totalAmount || 0)}</span>
              </div>
              
              {order?.commissionAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Store className="h-3.5 w-3.5 text-orange-500" /> Vendor Commission:
                  </span>
                  <span className="font-medium text-orange-600">{formatCurrency(order?.commissionAmount || 0)}</span>
                </div>
              )}
              
              <Separator className="my-2" />
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-base">Total Paid:</span>
                <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {formatCurrency(order?.totalAmount || 0)}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* ── Receipt Section (If exists) ── */}
          {order?.receipt?.url && (
            <div className="rounded-xl border overflow-hidden">
              <div className="bg-muted/40 px-4 py-2 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Payment Receipt / Slip</h4>
                </div>
                <a href={order.receipt.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium">
                  View Full Image <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="p-4 bg-slate-50/50 dark:bg-slate-900/20 flex justify-center">
                <a href={order.receipt.url} target="_blank" rel="noreferrer" className="block max-w-full relative group rounded-md overflow-hidden border shadow-sm">
                  <img
                    src={order.receipt.url}
                    alt="POS Receipt"
                    className="max-h-64 object-contain transition-transform group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ExternalLink className="h-8 w-8 text-white" />
                  </div>
                </a>
              </div>
            </div>
          )}

          {/* ── Specific Roles Details (3 Cols) ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Sales Manager */}
            <div className="rounded-xl border p-4 space-y-3 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20 dark:to-transparent">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-blue-500/10">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                </div>
                <h4 className="font-semibold text-xs uppercase tracking-wider text-blue-700 dark:text-blue-400">Sales Manager</h4>
              </div>
              {sm ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="font-medium">{`${sm.firstName} ${sm.lastName}`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground text-xs break-all">{sm.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{sm.phone || 'N/A'}</span>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center pb-4 text-muted-foreground text-xs italic">
                  No explicit manager assigned
                </div>
              )}
            </div>

            {/* Customer */}
            <div className="rounded-xl border p-4 space-y-3 bg-gradient-to-br from-sky-50/50 to-transparent dark:from-sky-950/20 dark:to-transparent">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-sky-500/10">
                  <UserIcon className="h-4 w-4 text-sky-600" />
                </div>
                <h4 className="font-semibold text-xs uppercase tracking-wider text-sky-700 dark:text-sky-400">Customer</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="font-medium">{order?.customerName || 'Guest Walk-in'}</span>
                </div>
                {order?.customerPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{order.customerPhone}</span>
                  </div>
                )}
                {!order?.customerPhone && !order?.customerName && (
                  <p className="text-xs text-muted-foreground italic">Basic POS Walk-in Sale</p>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="rounded-xl border p-4 space-y-3 bg-gradient-to-br from-violet-50/50 to-transparent dark:from-violet-950/20 dark:to-transparent">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-violet-500/10">
                  <MapPin className="h-4 w-4 text-violet-600" />
                </div>
                <h4 className="font-semibold text-xs uppercase tracking-wider text-violet-700 dark:text-violet-400">Delivery Info</h4>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-xs">
                  {order?.deliveryAddress || 'No Delivery Address specified (Likely In-Store)'}
                </p>
                {order?.deliveryAddress && (
                  <>
                    <Separator className="my-1" />
                    <div className="flex flex-wrap gap-2">
                      {order?.state && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 dark:bg-violet-900/30 px-2.5 py-0.5 text-[10px] font-medium text-violet-700 dark:text-violet-300">
                          <MapPin className="h-3 w-3" /> {order.state}
                        </span>
                      )}
                      {order?.lga && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 dark:bg-violet-900/30 px-2.5 py-0.5 text-[10px] font-medium text-violet-700 dark:text-violet-300">
                          {order.lga}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t bg-muted/20 flex flex-col sm:flex-row gap-2 sm:justify-between items-center rounded-b-lg mt-auto">
          <Button
            variant="outline"
            className="w-full sm:w-auto gap-2 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-indigo-800 dark:hover:bg-indigo-950 dark:hover:text-indigo-300 transition-colors"
            onClick={handlePrintSlip}
          >
            <Download className="h-4 w-4" /> Download Slip
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md transition-all"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
