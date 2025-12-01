import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type ShippingRegion } from './schema'

type DialogType = 'add' | 'edit' | 'delete'

type ShippingContextType = {
  open: DialogType | null
  setOpen: (str: DialogType | null) => void
  currentRow: ShippingRegion | null
  setCurrentRow: React.Dispatch<React.SetStateAction<ShippingRegion | null>>
  updateRegion: (id: string, changes: Partial<ShippingRegion>) => void
  addRegion: (region: ShippingRegion) => void
  removeRegion: (id: string) => void
}

const ShippingContext = React.createContext<ShippingContextType | null>(null)

export function ShippingRegionsProvider({
  children,
  addRegion,
  removeRegion,
  updateRegion,
}: {
  children: React.ReactNode
  addRegion: (region: ShippingRegion) => void
  removeRegion: (id: string) => void
  updateRegion: (id: string, changes: Partial<ShippingRegion>) => void
}) {
  const [open, setOpen] = useDialogState<DialogType>(null)
  const [currentRow, setCurrentRow] = useState<ShippingRegion | null>(null)

  return (
    <ShippingContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        updateRegion,
        addRegion,
        removeRegion,
      }}
    >
      {children}
    </ShippingContext.Provider>
  )
}

export const useShippingRegions = () => {
  const context = React.useContext(ShippingContext)

  if (!context) {
    throw new Error(
      'useShippingRegions must be used within a ShippingRegionsProvider'
    )
  }

  return context
}
