import axios from 'axios'
import { API_CONFIG, apiUrl } from '@/config/api'
import { toast } from 'sonner'
import { useAuth } from '@/context/auth-context'
import { ContentSection } from '../components/content-section'
import { AccountForm } from './account-form'

export function SettingsAccount() {
  const { login, user } = useAuth()



  const handleUpdate = async (data: any) => {
    const [firstName, ...lastName] = data.name.split(' ')

    const payload: Record<string, any> = {
      firstName,
      lastName: lastName.join(' '),
      phone: data.phone,
      shippingAddress: data.shippingAddress,
      shippingState: data.shippingState,
      shippingLga: data.shippingLga,
      gender: data.gender,
      dateOfBirth: data.dob ? new Date(data.dob).toISOString() : undefined,
    }

    try {
      const response = await axios.put(
        apiUrl(API_CONFIG.ENDPOINTS.USER.UPDATE + user?.id) ,
        payload
      )
      const updatedUser = response.data?.user
      if (updatedUser) {
        login(updatedUser) // Update user in auth context
      }
      toast.success('Account updated successfully!')
      console.log('Update response:', response.data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update account.')
      console.error('Update Error:', error)
    }

  }

  return (
    <ContentSection
      title='Account'
      desc='Update your account settings. Set your preferred language and
          timezone.'
    >
      <AccountForm onUpdate={handleUpdate} />
    </ContentSection>
  )
}
