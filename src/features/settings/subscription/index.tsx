// @ts-nocheck
import { ContentSection } from '../components/content-section'
import { SubscriptionForm } from './subscription'

export function SubscriptionSettings() {
  return (
    <ContentSection
      title='Subscription Settings'
      description='Manage your subscription plan and billing information.'
    >
      <SubscriptionForm />
    </ContentSection>
  )
}
