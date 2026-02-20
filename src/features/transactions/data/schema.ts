import { z } from 'zod'

export const transactionSchema = z.object({
  _id: z.string(),
  userId: z.string().optional(),
  userRole: z.string().optional(),
  walletId: z.union([
    z.string(),
    z.object({
      _id: z.string(),
      balance: z.number().optional(),
      currency: z.string().optional(),
    })
  ]).optional(),
  amount: z.number(),
  type: z.string(),
  status: z.string(),
  for: z.string().optional(),
  description: z.string().optional(),
  reference: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  userDetails: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    businessName: z.string().optional(),
    role: z.string().optional(),
  }).optional(),
})

export type Transaction = z.infer<typeof transactionSchema>
