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
import { ShippingRegionsProvider, useShippingRegions } from './provider'
import { type ShippingRegion } from './schema'

export function ShippingForm() {
  const [regions, setRegions] = useState<ShippingRegion[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchShippingFees() {
      try {
        setIsLoading(true)
        const response = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.SHIPPING_FEE.GET_ALL)
        )
        const fetchedData = response.data.deliveryFees
        setRegions(fetchedData)
      } catch (error) {
        console.error('Failed to fetch shipping fees:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchShippingFees()
  }, [])

  const addRegion = (newRegion: ShippingRegion) => {
    setRegions((prev) =>
      [...prev, newRegion].sort((a, b) => a.region.localeCompare(b.region))
    )
  }

  const removeRegion = (id: string) => {
    setRegions((prev) => prev.filter((r) => r.id !== id))
  }

  const updateRegion = (id: string, changes: Partial<ShippingRegion>) => {
    setRegions((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...changes } : r))
    )
  }

  return (
    <ShippingRegionsProvider
      addRegion={addRegion}
      removeRegion={removeRegion}
      updateRegion={updateRegion}
    >
      <ShippingRegionsTable data={regions} isLoading={isLoading} />
      <Dialogs regions={regions} />
    </ShippingRegionsProvider>
  )
}

function ShippingRegionsTable({
  data,
  isLoading,
}: {
  data: ShippingRegion[]
  isLoading: boolean
}) {
  const { setOpen } = useShippingRegions()
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-end'>
        <Button onClick={() => setOpen('add')}>
          <PlusCircle className='mr-2 h-4 w-4' /> Add Region
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
                  {isLoading ? 'Loading regions...' : 'No regions added.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
