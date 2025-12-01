import { ActionDialog } from './action-dialog'
import { DeleteDialog } from './delete-dialog'
import { useShippingRegions } from './provider'
import { type ShippingRegion } from './schema'

type DialogsProps = {
  regions: ShippingRegion[]
}

export function Dialogs({ regions }: DialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useShippingRegions()

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setOpen(null)
      setCurrentRow(null)
    }
  }

  return (
    <>
      <ActionDialog
        key='region-add'
        open={open === 'add'}
        onOpenChange={handleOpenChange}
        existingRegions={regions}
      />

      {currentRow && (
        <>
          <ActionDialog
            key={`region-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={handleOpenChange}
            currentRow={currentRow}
            existingRegions={regions}
          />
          <DeleteDialog
            key={`region-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={handleOpenChange}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
