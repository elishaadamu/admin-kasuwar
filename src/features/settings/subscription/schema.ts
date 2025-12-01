import { z } from 'zod'

export const subscriptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  duration: z.number(), // in days
})

export type Subscription = z.infer<typeof subscriptionSchema>
