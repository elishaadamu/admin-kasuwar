import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Transactions } from '@/features/transactions'

const transactionsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
})

export const Route = createFileRoute('/_authenticated/transactions/')({
  validateSearch: transactionsSearchSchema,
  component: Transactions,
})
