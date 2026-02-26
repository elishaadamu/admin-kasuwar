import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Pos } from '@/features/pos'

const posSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z.array(z.string()).optional().catch([]),
  orderId: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/pos/')({
  validateSearch: posSearchSchema,
  component: Pos,
})
