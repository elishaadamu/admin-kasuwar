import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type User } from '../data/schema'

type UsersDialogType = 'invite' | 'add' | 'edit' | 'delete'

type UsersContextType = {
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: User | null
  setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>
}

type UsersContextInternal = UsersContextType & {
  updateUser: (id: string, changes: Partial<any>) => void
  removeUser: (id: string) => void
}

const UsersContext = React.createContext<UsersContextInternal | null>(null)

export function UsersProvider({
  children,
  updateUser,
  removeUser,
}: {
  children: React.ReactNode
  updateUser?: (id: string, changes: Partial<any>) => void
  removeUser?: (id: string) => void
}) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<User | null>(null)

  const ctxUpdateUser = updateUser ?? (() => {})
  const ctxRemoveUser = removeUser ?? (() => {})

  return (
    <UsersContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        updateUser: ctxUpdateUser,
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
