import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type PosOrder } from '../data/schema'

type PosDialogType = 'verify' | 'view' | 'delete' | 'receipt'

type PosContextType = {
  open: PosDialogType | null
  setOpen: (str: PosDialogType | null) => void
  currentRow: PosOrder | null
  setCurrentRow: React.Dispatch<React.SetStateAction<PosOrder | null>>
  updateOrder: (id: string, changes: Partial<PosOrder>) => void
  addOrder: (order: PosOrder) => void
  removeOrder: (id: string) => void
}

const PosContext = React.createContext<PosContextType | null>(null)

export function PosProvider({
  children,
  addOrder,
  removeOrder,
  updateOrder,
}: {
  children: React.ReactNode
  addOrder?: (order: PosOrder) => void
  removeOrder?: (id: string) => void
  updateOrder?: (id: string, changes: Partial<PosOrder>) => void
}) {
  const [open, setOpen] = useDialogState<PosDialogType>(null)
  const [currentRow, setCurrentRow] = useState<PosOrder | null>(null)

  return (
    <PosContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        updateOrder: updateOrder || (() => {}),
        addOrder: addOrder || (() => {}),
        removeOrder: removeOrder || (() => {}),
      }}
    >
      {children}
    </PosContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePos = () => {
  const posContext = React.useContext(PosContext)

  if (!posContext) {
    throw new Error('usePos has to be used within <PosContext>')
  }

  return posContext
}
