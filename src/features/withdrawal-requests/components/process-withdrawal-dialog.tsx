// @ts-nocheck
'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useUsers } from './users-provider'

// @ts-nocheck

const formSchema = z.object({
  action: z.enum(['approve', 'reject'], {
    required_error: 'You need to select an action.',
  }),
  notes: z.string().optional(),
})

type ProcessWithdrawalForm = z.infer<typeof formSchema>

type ProcessWithdrawalDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProcessWithdrawalDialog({
  open,
  onOpenChange,
}: ProcessWithdrawalDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { currentRow, processWithdrawal } = useUsers()

  const form = useForm<ProcessWithdrawalForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      action: undefined,
      notes: '',
    },
  })

  const onSubmit = async (values: ProcessWithdrawalForm) => {
    if (!currentRow || !processWithdrawal) return

    setIsLoading(true)
    try {
      await processWithdrawal(currentRow._id, values.action, values.notes)
      form.reset()
      onOpenChange(false)
    } catch (error) {
      // Error is handled by toast.promise in the parent component
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
          <DialogTitle>Process Withdrawal Request</DialogTitle>
          <DialogDescription>
            Approve or reject the withdrawal request for &quot;
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='process-withdrawal-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='action'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select an action' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='approve'>Approve</SelectItem>
                      <SelectItem value='reject'>Reject</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='notes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder='Add any relevant notes' {...field} />
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
            form='process-withdrawal-form'
            disabled={isLoading}
          >
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
