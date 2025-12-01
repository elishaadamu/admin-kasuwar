import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Subscription } from './schema'

type DialogType = 'add' | 'edit' | 'delete'

type SubscriptionContextType = {
  open: DialogType | null
  setOpen: (str: DialogType | null) => void
  currentRow: Subscription | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Subscription | null>>
  updateSubscription: (id: string, changes: Partial<Subscription>) => void
  addSubscription: (subscription: Subscription) => void
  removeSubscription: (id: string) => void
}

const SubscriptionContext = React.createContext<SubscriptionContextType | null>(
  null
)

export function SubscriptionsProvider({
  children,
  addSubscription,
  removeSubscription,
  updateSubscription,
}: {
  children: React.ReactNode
  addSubscription: (subscription: Subscription) => void
  removeSubscription: (id: string) => void
  updateSubscription: (id: string, changes: Partial<Subscription>) => void
}) {
  const [open, setOpen] = useDialogState<DialogType>(null)
  const [currentRow, setCurrentRow] = useState<Subscription | null>(null)

  return (
    <SubscriptionContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        updateSubscription,
        addSubscription,
        removeSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscriptions = () => {
  const context = React.useContext(SubscriptionContext)

  if (!context) {
    throw new Error(
      'useSubscriptions must be used within a SubscriptionsProvider'
    )
  }

  return context
}
