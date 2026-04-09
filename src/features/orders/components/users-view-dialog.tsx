// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Download,
  Package,
  User as UserIcon,
  Store,
  MapPin,
  CreditCard,
  ShoppingBag,
  Tag,
  Truck,
  Calendar,
  Hash,
  Phone,
  Mail,
  BadgePercent,
  Receipt,
} from 'lucide-react'
import { API_CONFIG, apiUrl } from '@/config/api'
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
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { type User as Order } from '../data/schema'

interface OrderProduct {
  _id: string
  productId: string
  name: string
  price: number
  quantity: number
  commission?: number
  images?: { url: string }[]
}

interface FullOrder extends Order {
  products: OrderProduct[]
  user: {
    _id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  vendor?: {
    _id: string
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    businessName?: string
    businessType?: string
  }
  totalAmount?: number
  originalAmount?: number
  couponDiscount?: string | number
  couponCode?: string
  deliveryAddress?: string
  state?: string
  lga?: string
  zipcode?: string
  phone?: string
  status?: string
  orderType?: string
  shippingFee?: number
  tax?: number
  createdAt?: string
}

type UsersViewDialogProps = {
  currentRow?: Order
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersViewDialog({
  currentRow,
  open,
  onOpenChange,
}: UsersViewDialogProps) {
  const [order, setOrder] = useState<FullOrder | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (open && currentRow) {
      const fetchOrderProducts = async () => {
        setIsLoading(true)
        try {
          const response = await axios.get(
            `${apiUrl(API_CONFIG.ENDPOINTS.ORDER.GET_SINGLE)}${user?.id}/${currentRow._id}`
          )
          console.log(response.data)
          setOrder(response.data.order || null)
        } catch (error) {
          console.error('Failed to fetch order products:', error)
        } finally {
          setIsLoading(false)
        }
      }
      fetchOrderProducts()
    }
  }, [open, currentRow])

  if (!currentRow || !order) return null

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
      case 'paid':
        return { label: 'Paid', bg: 'bg-emerald-500/15', text: 'text-emerald-600', border: 'border-emerald-500/30', dot: 'bg-emerald-500' }
      case 'pending':
        return { label: 'Pending', bg: 'bg-amber-500/15', text: 'text-amber-600', border: 'border-amber-500/30', dot: 'bg-amber-500' }
      case 'cancelled':
        return { label: 'Cancelled', bg: 'bg-red-500/15', text: 'text-red-600', border: 'border-red-500/30', dot: 'bg-red-500' }
      case 'delivered':
        return { label: 'Delivered', bg: 'bg-blue-500/15', text: 'text-blue-600', border: 'border-blue-500/30', dot: 'bg-blue-500' }
      case 'shipped':
        return { label: 'Shipped', bg: 'bg-violet-500/15', text: 'text-violet-600', border: 'border-violet-500/30', dot: 'bg-violet-500' }
      default:
        return { label: status || 'Unknown', bg: 'bg-gray-500/15', text: 'text-gray-600', border: 'border-gray-500/30', dot: 'bg-gray-500' }
    }
  }

  const getOrderTypeConfig = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'normal':
        return { label: 'Normal', bg: 'bg-sky-500/15', text: 'text-sky-700', border: 'border-sky-500/30' }
      case 'pos':
        return { label: 'POS', bg: 'bg-purple-500/15', text: 'text-purple-700', border: 'border-purple-500/30' }
      default:
        return { label: type || 'N/A', bg: 'bg-gray-500/15', text: 'text-gray-600', border: 'border-gray-500/30' }
    }
  }

  const statusConfig = getStatusConfig(order?.status)
  const orderTypeConfig = getOrderTypeConfig(order?.orderType)
  const couponDiscount = Number(order?.couponDiscount || 0)

  const handlePrintSlip = () => {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='h-[92vh] overflow-y-auto sm:max-w-3xl flex flex-col p-0'>
        {/* ── Header ── */}
        <div className="border-b bg-slate-50/50 dark:bg-slate-900/40 px-6 py-5 rounded-t-lg backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-500/10">
                  <Receipt className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                Order Details
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-muted-foreground text-sm">ID:</span>
                <span className="font-mono bg-muted/50 border border-border/50 px-2 py-0.5 rounded text-foreground text-sm font-semibold tracking-wide">
                  #{(order?._id || '').slice(-8).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 pr-6 sm:pr-8">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                <span className={`h-2 w-2 rounded-full ${statusConfig.dot} animate-pulse`} />
                {statusConfig.label}
              </span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${orderTypeConfig.bg} ${orderTypeConfig.text} ${orderTypeConfig.border}`}>
                {orderTypeConfig.label} Order
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 text-muted-foreground text-xs">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-indigo-500/70" />
              {formatDate(order?.createdAt)}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
              <span className="text-sm text-muted-foreground">Loading order details...</span>
            </div>
          </div>
        ) : (
          <div className='flex-1 space-y-5 text-sm text-foreground px-6 py-4'>

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
                    <tr className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/30">
                      <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Product</th>
                      <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground text-center">Qty</th>
                      <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Price</th>
                      <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Commission</th>
                      <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order?.products?.map((product, i) => (
                      <tr key={product._id || i} className="border-t hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 text-white text-xs font-bold shrink-0">
                              {product.name?.charAt(0)?.toUpperCase() || 'P'}
                            </div>
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                            {product.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{formatCurrency(product.price || 0)}</td>
                        <td className="px-4 py-3">
                          <span className="text-orange-600 font-medium">{formatCurrency(product.commission || 0)}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">{formatCurrency((product.price || 0) * (product.quantity || 1))}</td>
                      </tr>
                    ))}
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
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-emerald-500/10">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Payment Info</h4>
                </div>
                <div className="space-y-3 w-full">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Status</span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Order Type</span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${orderTypeConfig.bg} ${orderTypeConfig.text} ${orderTypeConfig.border}`}>
                      {orderTypeConfig.label}
                    </span>
                  </div>
                  {order?.couponCode && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm flex items-center gap-1">
                        <Tag className="h-3.5 w-3.5" /> Coupon
                      </span>
                      <span className="font-mono text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{order.couponCode}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm font-medium">Amount Paid</span>
                    <span className="text-base font-extrabold text-emerald-600">{formatCurrency(order?.totalAmount || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="rounded-xl border bg-gradient-to-br from-slate-50 via-white to-indigo-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 p-4 shadow-sm space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Original Amount:</span>
                  <span className="font-medium">{formatCurrency(order?.originalAmount || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax:</span>
                  <span className="font-medium">{formatCurrency(order?.tax || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5" /> Shipping Fee:
                  </span>
                  <span className="font-medium">{formatCurrency(order?.shippingFee || 0)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600 flex items-center gap-1">
                      <BadgePercent className="h-3.5 w-3.5" /> Coupon Discount
                      {order?.couponCode && (
                        <span className="ml-1 inline-flex items-center rounded-md bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          {order.couponCode}
                        </span>
                      )}
                    </span>
                    <span className="font-semibold text-emerald-600">-{formatCurrency(couponDiscount)}</span>
                  </div>
                )}
                <Separator className="my-1" />
                <div className="flex justify-between items-center pt-1">
                  <span className="font-bold text-base">Total Paid:</span>
                  <span className="text-lg font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {formatCurrency(order?.totalAmount || 0)}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* ── Customer, Vendor & Shipping Details ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

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
                    <span className="font-medium">
                      {order?.user?.firstName ? `${order.user.firstName} ${order.user.lastName}` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground text-xs break-all">{order?.user?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{order?.user?.phone || order?.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Vendor */}
              <div className="rounded-xl border p-4 space-y-3 bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-950/20 dark:to-transparent">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-orange-500/10">
                    <Store className="h-4 w-4 text-orange-600" />
                  </div>
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-orange-700 dark:text-orange-400">Vendor</h4>
                </div>
                <div className="space-y-2">
                  {order?.vendor?.businessName && (
                    <div className="flex items-center gap-2">
                      <Store className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="font-semibold">{order.vendor.businessName}</span>
                      {order?.vendor?.businessType && (
                        <Badge variant="outline" className="text-[10px] capitalize border-orange-300 text-orange-600">
                          {order.vendor.businessType}
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="font-medium">
                      {order?.vendor?.firstName ? `${order.vendor.firstName} ${order.vendor.lastName}` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground text-xs break-all">{order?.vendor?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{order?.vendor?.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="rounded-xl border p-4 space-y-3 bg-gradient-to-br from-violet-50/50 to-transparent dark:from-violet-950/20 dark:to-transparent">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-violet-500/10">
                    <MapPin className="h-4 w-4 text-violet-600" />
                  </div>
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-violet-700 dark:text-violet-400">Delivery Address</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {order?.deliveryAddress || 'N/A'}
                  </p>
                  <Separator className="my-1" />
                  <div className="flex flex-wrap gap-2">
                    {order?.state && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 dark:bg-violet-900/30 px-2.5 py-0.5 text-[11px] font-medium text-violet-700 dark:text-violet-300">
                        <MapPin className="h-3 w-3" /> {order.state}
                      </span>
                    )}
                    {order?.lga && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 dark:bg-violet-900/30 px-2.5 py-0.5 text-[11px] font-medium text-violet-700 dark:text-violet-300">
                        {order.lga}
                      </span>
                    )}
                    {order?.zipcode && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 dark:bg-violet-900/30 px-2.5 py-0.5 text-[11px] font-medium text-violet-700 dark:text-violet-300">
                        <Hash className="h-3 w-3" /> {order.zipcode}
                      </span>
                    )}
                  </div>
                  {order?.phone && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground text-xs">{order.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t bg-muted/20 flex flex-col sm:flex-row gap-2 sm:justify-between items-center rounded-b-lg">
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
