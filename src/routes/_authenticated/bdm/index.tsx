import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { BDM } from '@/features/bdm'

const customerSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  // You can add more customer-specific search params here
})

export const Route = createFileRoute('/_authenticated/bdm/')({
  validateSearch: customerSearchSchema,
  component: BDM,
})
