import axios from 'axios'
import { API_CONFIG, apiUrl } from '@/config/api'
import { toast } from 'sonner'
import { useAuth } from '@/context/auth-context'
import { ContentSection } from '../components/content-section'
import { AccountForm } from './account-form'

export function SettingsAccount() {
  const { login } = useAuth()

  const handleUpdate = async (data: any) => {
    const [firstName, ...lastName] = data.name.split(' ')

    const payload: Record<string, any> = {
      firstName,
      lastName: lastName.join(' '),
      email: data.email,
      phone: data.phone,
      address: data.address,
      state: data.state,
      localGovt: data.localGovt,
      gender: data.gender,
      dateOfBirth: data.dob ? new Date(data.dob).toISOString() : undefined,
    }

    if (
      data.avatar &&
      data.avatar.length > 0 &&
      typeof data.avatar !== 'string'
    ) {
      const fileToBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = (error) => reject(error)
        })
      payload.passportPhoto = await fileToBase64(data.avatar[0])
    }

    try {
      const response = await axios.put(
        apiUrl(API_CONFIG.ENDPOINTS.USER.UPDATE),
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
