// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { API_CONFIG, apiUrl } from '@/config/api'
import { PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { columns } from './columns'
import { Dialogs } from './dialogs'
import { SubscriptionsProvider, useSubscriptions } from './provider'
import { type Subscription } from './schema'

// @ts-nocheck

export function SubscriptionForm() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        setIsLoading(true)
        const response = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.SUBSCRIPTION.GET_ALL)
        )
        console.log('Fetched subscriptions:', response.data)
        // Ensure that the response data is an array before setting the state.
        // This prevents errors if the API returns something unexpected.
        if (response.data && Array.isArray(response.data.plans)) {
          // Access the 'plans' property from the response data
          const mappedSubscriptions = response.data.plans.map((plan: any) => ({
            ...plan,
            id: plan._id, // Map _id to id
            name: plan.package, // Map package to name
          }))
          setSubscriptions(mappedSubscriptions)
        } else {
          // Handle cases where the response is not as expected
          setSubscriptions([])
        }
      } catch (error) {
        console.error('Failed to fetch subscriptions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscriptions()
  }, [])

  const addSubscription = (newSubscription: Subscription) => {
    // The API response for creation might be nested under a 'plan' property.
    const subscriptionData = (newSubscription as any).plan || newSubscription
    const mappedSubscription = {
      ...subscriptionData,
      id: subscriptionData._id,
      name: subscriptionData.package,
    }
    setSubscriptions((prev) => {
      const currentSubscriptions = Array.isArray(prev) ? prev : []
      return [...currentSubscriptions, mappedSubscription].sort((a, b) =>
        a.name.localeCompare(b.name)
      ) // Assuming 'name' is 'package'
    })
  }

  const removeSubscription = (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id))
  }

  const updateSubscription = (id: string, changes: Partial<Subscription>) => {
    // The API response for update might also be nested or have 'package' instead of 'name'.
    const updatedData = (changes as any).plan || changes
    const mappedChanges = {
      ...updatedData,
      id: updatedData._id || id,
      name: updatedData.package || (changes as any).name,
    }
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...mappedChanges } : s))
    )
  }

  return (
    <SubscriptionsProvider
      addSubscription={addSubscription}
      removeSubscription={removeSubscription}
      updateSubscription={updateSubscription}
    >
      <SubscriptionsTable data={subscriptions} isLoading={isLoading} />
      <Dialogs subscriptions={subscriptions} />
    </SubscriptionsProvider>
  )
}

function SubscriptionsTable({
  data,
  isLoading,
}: {
  data: Subscription[]
  isLoading: boolean
}) {
  const { setOpen } = useSubscriptions()
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-medium'>Subscriptions</h3>
          <p className='text-muted-foreground text-sm'>
            Manage subscription plans and their prices.
          </p>
        </div>
        <Button onClick={() => setOpen('add')}>
          <PlusCircle className='mr-2 h-4 w-4' /> Add Subscription
        </Button>
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  {isLoading
                    ? 'Loading subscriptions...'
                    : 'No subscriptions added.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
