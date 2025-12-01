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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useUsers } from './users-provider'

// @ts-nocheck

const formSchema = z.object({
  approvedPrice: z.coerce
    .number()
    .min(0, 'Approved price cannot be negative.')
    .optional(),
  adminNotes: z.string().optional(),
})

type ApproveForm = z.infer<typeof formSchema>

type UsersApproveDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersApproveDialog({
  open,
  onOpenChange,
}: UsersApproveDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { user: authUser } = useAuth()
  const { currentRow, updateUser } = useUsers()

  const form = useForm<ApproveForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      approvedPrice: undefined,
      adminNotes: '',
    },
  })

  const onSubmit = async (values: ApproveForm) => {
    if (!authUser || !currentRow) return

    setIsLoading(true)
    const prevStatus = currentRow.status
    // Optimistic update
    updateUser(currentRow._id, { status: 'approved' })

    try {
      await toast.promise(
        axios.put(
          `${apiUrl(API_CONFIG.ENDPOINTS.DELIVERY_REQUESTS.APPROVE)}${authUser.id}/${currentRow._id}`,
          {
            approvedPrice: values.approvedPrice,
            adminNotes: values.adminNotes,
          }
        ),
        {
          loading: 'Approving delivery request...',
          success: 'Delivery request has been approved.',
          error: (err) => {
            console.error('Failed to approve delivery request:', err)
            return (
              err.response?.data?.message ||
              'Failed to approve delivery request.'
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
          <DialogTitle>Approve Delivery Request</DialogTitle>
          <DialogDescription>
            Approve the delivery request for &quot;{currentRow?.senderName}
            &quot;. Provide an approved price and any relevant notes.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='approve-request-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='approvedPrice'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Approved Price</FormLabel>
                  <FormControl>
                    <Input
                      required
                      type='number'
                      placeholder='e.g., 1500'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='adminNotes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Add any notes for approval'
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
          <Button
            type='submit'
            form='approve-request-form'
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : null}
            Approve Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
