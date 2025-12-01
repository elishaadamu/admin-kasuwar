import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type User } from '../data/schema'

type UsersDialogType = 'invite' | 'add' | 'edit' | 'delete'

type UsersContextType = {
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: User | null
  setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>
  /**
   * updateUser should update an existing user in the list (partial update)
   * Provided by the parent (BD) so it can update the users state there.
   */
  updateUser: (id: string, changes: Partial<User>) => void
  addUser: (user: User) => void
  removeUser: (id: string) => void
}

const UsersContext = React.createContext<UsersContextType | null>(null)

export function UsersProvider({
  children,
  addUser,
  removeUser,
  updateUser,
}: {
  children: React.ReactNode
  addUser?: (user: User) => void
  removeUser?: (id: string) => void
  updateUser?: (id: string, changes: Partial<User>) => void
}) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<User | null>(null)

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

// eslint-disable-next-line react-refresh/only-export-components
export const useUsers = () => {
  const usersContext = React.useContext(UsersContext)

  if (!usersContext) {
    throw new Error('useUsers has to be used within <UsersContext>')
  }

  return usersContext
}
