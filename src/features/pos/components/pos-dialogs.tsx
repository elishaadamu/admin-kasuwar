import { PosVerifyDialog } from './pos-verify-dialog'
import { PosViewDialog } from './pos-view-dialog'
import { PosReceiptDialog } from './pos-receipt-dialog'
import { usePos } from './pos-provider'

export function PosDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = usePos()

  const closeWithDelay = () => {
    setOpen(null)
    setTimeout(() => setCurrentRow(null), 500)
  }

  return (
    <>
      {currentRow && (
        <>
          <PosViewDialog
            key={`pos-view-${currentRow._id}`}
            open={open === 'view'}
            onOpenChange={(val) => { if (!val) closeWithDelay() }}
            currentRow={currentRow}
          />

          <PosVerifyDialog
            key={`pos-verify-${currentRow._id}`}
            open={open === 'verify'}
            onOpenChange={(val) => { if (!val) closeWithDelay() }}
            currentRow={currentRow}
          />

          <PosReceiptDialog
            key={`pos-receipt-${currentRow._id}`}
            open={open === 'receipt'}
            onOpenChange={(val) => { if (!val) closeWithDelay() }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
