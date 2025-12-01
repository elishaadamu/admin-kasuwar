import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Banner } from './users-columns'

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

type UsersContextType = {
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: Banner | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Banner | null>>
  /**
   * updateUser should update an existing user in the list (partial update)
   * Provided by the parent (BD) so it can update the users state there.
   */
  updateUser: (id: string, changes: Partial<Banner>) => void
  addUser: (user: Banner) => void
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
  addUser?: (user: Banner) => void
  removeUser?: (id: string) => void
  updateUser?: (id: string, changes: Partial<Banner>) => void
}) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Banner | null>(null)

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
