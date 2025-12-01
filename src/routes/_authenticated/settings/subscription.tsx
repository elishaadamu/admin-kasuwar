import { createFileRoute } from '@tanstack/react-router'
import { SubscriptionSettings } from '@/features/settings/subscription'

export const Route = createFileRoute('/_authenticated/settings/subscription')({
  component: SubscriptionSettings,
})
