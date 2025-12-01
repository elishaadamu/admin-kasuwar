import { z } from 'zod'

export const shippingRegionSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().min(0),
})

export type ShippingRegion = z.infer<typeof shippingRegionSchema>
