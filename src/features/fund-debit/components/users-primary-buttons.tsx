import { useState } from 'react'
import axios from 'axios'
import { API_CONFIG, apiUrl } from '@/config/api'
import { Loader2, MailPlus } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'

export function UsersPrimaryButtons() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleDownloadReport = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(
        `${apiUrl(API_CONFIG.ENDPOINTS.DELIVERY_REQUESTS.GET_REPORT)}${user?.id}`
      )
      console.log('Report response:', response.data)
      toast.success('Report sent successfully')
    } catch (error) {
      console.error('Error sending report:', error)
      toast.error('Failed to send report')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex gap-2'>
      <Button
        className='space-x-1'
        onClick={handleDownloadReport}
        disabled={isLoading}
      >
        {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
        <span>{isLoading ? 'Sending Report...' : 'Send Report'}</span>
        {!isLoading && <MailPlus size={18} />}
      </Button>
    </div>
  )
}
