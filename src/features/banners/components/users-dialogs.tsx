// @ts-nocheck
import { BannerActionDialog } from './banner-action-dialog'
import { UsersDeleteDialog } from './users-delete-dialog'
import { useUsers } from './users-provider'

export function UsersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers()
  return (
    <>
      <BannerActionDialog
        key='user-add'
        open={open === 'add' || open === 'invite'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'add' : null)}
      />

      {currentRow && (
        <>
          <BannerActionDialog
            key={`user-edit-${currentRow._id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen(open === 'edit' ? null : 'edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <UsersDeleteDialog
            key={`user-delete-${currentRow._id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen(open === 'delete' ? null : 'delete')
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
