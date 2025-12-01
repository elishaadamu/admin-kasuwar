import { createFileRoute } from '@tanstack/react-router'
import { SHIPPINGMETHOD } from '@/features/settings/shipping-method'

export const Route = createFileRoute(
  '/_authenticated/settings/shipping-methods'
)({
  component: SHIPPINGMETHOD,
})
