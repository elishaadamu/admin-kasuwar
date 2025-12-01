import { ProcessWithdrawalDialog } from './process-withdrawal-dialog'
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
              setOpen('process')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
          />
        </>
      )}
    </>
  )
}
