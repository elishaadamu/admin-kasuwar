import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type RewardConfig } from './reward-configs-list'

type UsersDialogType =
  | 'invite'
  | 'add'
  | 'edit'
  | 'delete'
  | 'view'
  | 'approve'
  | 'cancel'
  | 'assign'
  | 'set-price'
  | 'reward-config'


type UsersContextType = {
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: RewardConfig | null
  setCurrentRow: React.Dispatch<React.SetStateAction<RewardConfig | null>>
  /**
   * updateRewardConfig should update an existing reward config in the list (partial update)
   */
  updateUser: (id: string, changes: Partial<RewardConfig>) => void
  addUser: (config: RewardConfig) => void
  removeUser: (id: string) => void
  // list of delivery men available for assignment
  deliveryMen?: any[] // This seems unused for banners, but keeping for now to avoid breaking other parts.
  // assign a delivery task to a delivery man
  assignDeliveryTask?: (
    requestId: string,
    deliveryManId: string,
    price: number
  ) => Promise<void>
  // set a price for a delivery task
  setDeliveryPrice?: (requestId: string, price: number) => Promise<void>
}

const UsersContext = React.createContext<UsersContextType | null>(null)

export function UsersProvider({
  children,
  addUser,
  removeUser,
  updateUser,
}: {
  children: React.ReactNode
  addUser?: (config: RewardConfig) => void
  removeUser?: (id: string) => void
  updateUser?: (id: string, changes: Partial<RewardConfig>) => void
}) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<RewardConfig | null>(null)

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
