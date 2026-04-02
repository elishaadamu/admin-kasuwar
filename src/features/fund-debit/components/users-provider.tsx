import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type User as DeliveryMan } from '../../delivery-management/data/schema'
import { type FundDebitUser } from '../types'

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
  | 'fund'
  | 'debit'

type UsersContextType = {
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: FundDebitUser | null
  setCurrentRow: React.Dispatch<React.SetStateAction<FundDebitUser | null>>
  /**
   * updateUser should update an existing user in the list (partial update)
   * Provided by the parent (BD) so it can update the users state there.
   */
  updateUser: (id: string, changes: Partial<FundDebitUser>) => void
  addUser: (user: FundDebitUser) => void
  removeUser: (id: string) => void
  // list of delivery men available for assignment
  deliveryMen?: DeliveryMan[]
  // assign a delivery task to a delivery man
  assignDeliveryTask?: (
    requestId: string,
    deliveryManId: string,
    price: number
  ) => Promise<void>
  // set a price for a delivery task
  setDeliveryPrice?: (requestId: string, price: number) => Promise<void>
  // fund a user's wallet
  onFund?: (userId: string, amount: number, description?: string) => Promise<void>
  // debit a user's wallet
  onDebit?: (userId: string, amount: number, description?: string) => Promise<void>
}

const UsersContext = React.createContext<UsersContextType | null>(null)

export function UsersProvider({
  children,
  addUser,
  removeUser,
  updateUser,
  deliveryMen,
  assignDeliveryTask,
  setDeliveryPrice,
  onFund,
  onDebit,
}: {
  children: React.ReactNode
  addUser?: (user: FundDebitUser) => void
  removeUser?: (id: string) => void
  updateUser?: (id: string, changes: Partial<FundDebitUser>) => void
  deliveryMen?: DeliveryMan[]
  assignDeliveryTask?: (
    requestId: string,
    deliveryManId: string,
    price: number
  ) => Promise<void>
  setDeliveryPrice?: (requestId: string, price: number) => Promise<void>
  onFund?: (userId: string, amount: number, description?: string) => Promise<void>
  onDebit?: (userId: string, amount: number, description?: string) => Promise<void>
}) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<FundDebitUser | null>(null)

  const ctxUpdateUser = updateUser ?? (() => {})

  const ctxAddUser = addUser ?? (() => {})
  const ctxRemoveUser = removeUser ?? (() => {})
  const ctxDeliveryMen = deliveryMen ?? []
  const ctxAssignDeliveryTask = assignDeliveryTask ?? (async () => {})
  const ctxSetDeliveryPrice = setDeliveryPrice ?? (async () => {})
  const ctxOnFund = onFund ?? (async () => {})
  const ctxOnDebit = onDebit ?? (async () => {})

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
        deliveryMen: ctxDeliveryMen,
        assignDeliveryTask: ctxAssignDeliveryTask,
        setDeliveryPrice: ctxSetDeliveryPrice,
        onFund: ctxOnFund,
        onDebit: ctxOnDebit,
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
