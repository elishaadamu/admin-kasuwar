import { ContentSection } from '../components/content-section'
import { ShippingForm } from './shipping'

export function SHIPPINGMETHOD() {
  return (
    <ContentSection
      title='Shipping Regions'
      desc='Manage shipping regions and their prices.'
    >
      <ShippingForm />
    </ContentSection>
  )
}
