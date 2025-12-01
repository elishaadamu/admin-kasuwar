// @ts-nocheck
'use client'

import { useState } from 'react'
import { z } from 'zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { API_CONFIG, apiUrl } from '@/config/api'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { useUsers } from './users-provider'

// @ts-nocheck

const formSchema = z.object({
  adminNotes: z.string().min(1, 'Cancellation notes are required.'),
})

type CancelForm = z.infer<typeof formSchema>

type UsersCancelDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersCancelDialog({
  open,
  onOpenChange,
}: UsersCancelDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { user: authUser } = useAuth()
  const { currentRow, updateUser } = useUsers()

  const form = useForm<CancelForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      adminNotes: '',
    },
  })

  const onSubmit = async (values: CancelForm) => {
    if (!authUser || !currentRow) return

    setIsLoading(true)
    const prevStatus = currentRow.status
    // Optimistic update
    updateUser(currentRow._id, { status: 'cancelled' })

    try {
      await toast.promise(
        axios.put(
          `${apiUrl(API_CONFIG.ENDPOINTS.DELIVERY_REQUESTS.CANCEL)}${authUser.id}/${currentRow._id}`,
          {
            adminNotes: values.adminNotes,
          }
        ),
        {
          loading: 'Cancelling delivery request...',
          success: 'Delivery request has been cancelled.',
          error: (err) => {
            console.error('Failed to cancel delivery request:', err)
            return (
              err.response?.data?.message ||
              'Failed to cancel delivery request.'
            )
          },
        }
      )
      form.reset()
      onOpenChange(false)
    } catch (err) {
      // Revert on error
      updateUser(currentRow._id, { status: prevStatus })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle>Cancel Delivery Request</DialogTitle>
          <DialogDescription>
            Cancel the delivery request for &quot;{currentRow?.senderName}
            &quot;. Please provide a reason for cancellation.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='cancel-request-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='adminNotes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cancellation Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Reason for cancellation'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='cancel-request-form' disabled={isLoading}>
            {isLoading ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : null}
            Cancel Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
