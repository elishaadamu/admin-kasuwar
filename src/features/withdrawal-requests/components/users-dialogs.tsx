import { ProcessWithdrawalDialog } from './process-withdrawal-dialog'
import { UsersViewDialog } from './users-view-dialog'
import { useUsers } from './users-provider'

export function UsersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers()
  return (
    <>
      {currentRow && (
        <>
          <ProcessWithdrawalDialog
            key={`process-withdrawal-${currentRow._id}`}
            open={open === 'process'}
            onOpenChange={() => {
              setOpen(null)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
          />
          <UsersViewDialog
            key={`view-withdrawal-${currentRow._id}`}
            open={open === 'view'}
            onOpenChange={() => {
              setOpen(null)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
