import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { HRManagement } from '@/features/hr'

const customerSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
})

export const Route = createFileRoute('/_authenticated/hr/')({
  validateSearch: customerSearchSchema,
  component: HRManagement,
})
