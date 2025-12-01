// @ts-nocheck
import { ActionDialog } from './action-dialog'
import { type Subscription } from './data/schema'
import { DeleteDialog } from './delete-dialog'
import { useSubscriptions } from './provider'

type DialogsProps = {
  subscriptions: Subscription[]
}

export function Dialogs({ subscriptions }: DialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useSubscriptions()

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setOpen(null)
      setCurrentRow(null)
    }
  }

  return (
    <>
      <ActionDialog
        key='subscription-add'
        open={open === 'add'}
        onOpenChange={handleOpenChange}
      />

      {currentRow && (
        <>
          <ActionDialog
            key={`subscription-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={handleOpenChange}
            currentRow={currentRow}
          />
          <DeleteDialog
            key={`subscription-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={handleOpenChange}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
