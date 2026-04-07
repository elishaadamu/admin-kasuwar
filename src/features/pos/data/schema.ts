import { z } from 'zod'

const posProductSchema = z.object({
  productId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  quantity: z.number(),
  price: z.number(),
  vendor: z.string(),
  _id: z.string(),
})

const posSalesManagerSchema = z.object({
  _id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: z.string(),
}).nullable()

const posReceiptSchema = z.object({
  url: z.string(),
  public_id: z.string(),
}).optional()

export const posOrderSchema = z.object({
  _id: z.string(),
  salesManager: posSalesManagerSchema,
  customer: z.string().nullable().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  products: z.array(posProductSchema),
  totalAmount: z.number(),
  deliveryAddress: z.string().optional(),
  state: z.string().optional(),
  lga: z.string().optional(),
  zipcode: z.string().optional(),
  uniqueOrderCode: z.string(),
  status: z.string(),
  paymentStatus: z.string(),
  linkedOrder: z.string().optional(),
  receipt: posReceiptSchema,
  customerInfo: z.object({ sendEmail: z.boolean() }).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
})

export type PosOrder = z.infer<typeof posOrderSchema>

export const posOrderListSchema = z.array(posOrderSchema)
