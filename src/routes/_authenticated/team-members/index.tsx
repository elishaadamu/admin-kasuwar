import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { TeamMembers } from '@/features/team-members'

const customerSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  // You can add more customer-specific search params here
})

export const Route = createFileRoute('/_authenticated/team-members/')({
  validateSearch: customerSearchSchema,
  component: TeamMembers,
})
