import { z } from 'zod'

const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('invited'),
  z.literal('suspended'),
])
export type UserStatus = z.infer<typeof userStatusSchema>

const userRoleSchema = z.union([
  z.literal('superadmin'),
  z.literal('admin'),
  z.literal('cashier'),
  z.literal('manager'),
])

const userSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  suspended: z.boolean().default(false),
  virtualAcc: z.boolean().optional(),
  walletBalance: z.number().optional(),
  // These fields might not be in your customer response, but are kept for broader compatibility
  status: userStatusSchema.optional(),
  role: userRoleSchema.optional(),
})
export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)
