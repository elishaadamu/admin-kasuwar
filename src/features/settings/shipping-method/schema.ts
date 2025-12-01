import { z } from 'zod'

export const shippingRegionSchema = z.object({
  id: z.string(),
  region: z.string(),
  price: z.number(),
  deliveryType: z.string(),
  duration: z.string(),
})

export type ShippingRegion = z.infer<typeof shippingRegionSchema>
