import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type DeliveryRequest } from '../types'

type UsersDialogType = 'process'

type UsersContextType = {
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: DeliveryRequest | null
  setCurrentRow: React.Dispatch<React.SetStateAction<DeliveryRequest | null>>
  updateUser: (id: string, changes: Partial<DeliveryRequest>) => void
  addUser: (user: DeliveryRequest) => void
  removeUser: (id: string) => void
  processWithdrawal?: (
    withdrawalId: string,
    action: 'approve' | 'reject',
    notes?: string
  ) => Promise<void>
}

const UsersContext = React.createContext<UsersContextType | null>(null)

export function UsersProvider({
  children,
  addUser,
  removeUser,
  updateUser,
  processWithdrawal,
}: {
  children: React.ReactNode
  addUser?: (user: DeliveryRequest) => void
  removeUser?: (id: string) => void
  updateUser?: (id: string, changes: Partial<DeliveryRequest>) => void
  processWithdrawal?: (
    withdrawalId: string,
    action: 'approve' | 'reject',
    notes?: string
  ) => Promise<void>
}) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<DeliveryRequest | null>(null)

  const ctxUpdateUser = updateUser ?? (() => {})
  const ctxAddUser = addUser ?? (() => {})
  const ctxRemoveUser = removeUser ?? (() => {})
  return (
    <UsersContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        updateUser: ctxUpdateUser,
        addUser: ctxAddUser,
        removeUser: ctxRemoveUser,
        processWithdrawal,
      }}
    >
      {children}
    </UsersContext.Provider>
  )
}

export const useUsers = () => {
  const usersContext = React.useContext(UsersContext)

  if (!usersContext) {
    throw new Error('useUsers has to be used within <UsersContext>')
  }

  return usersContext
}
