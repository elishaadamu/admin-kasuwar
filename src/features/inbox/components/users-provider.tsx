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
  updateUser: (id: string, changes: Partial<any>) => void
}

const UsersContext = React.createContext<UsersContextType | null>(null)

export function UsersProvider({
  children,
  updateUser,
}: {
  children: React.ReactNode
  updateUser?: (id: string, changes: Partial<User>) => void
}) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<User | null>(null)

  const ctxUpdateUser = updateUser ?? (() => {})

  return (
    <UsersContext
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        updateUser: ctxUpdateUser,
      }}
    >
      {children}
    </UsersContext>
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
