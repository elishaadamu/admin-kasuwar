import { UsersActionDialog } from './users-action-dialog'
import { UsersAssignDialog } from './users-assign-dialog'
import { UsersDeleteDialog } from './users-delete-dialog'
import { UsersInviteDialog } from './users-invite-dialog'
import { useUsers } from './users-provider'
import { UsersShippingDialog } from './users-shipping-dialog'
import { UsersStatusDialog } from './users-status-dialog'
import { UsersViewDialog } from './users-view-dialog'

export function UsersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers()
  return (
    <>
      <UsersActionDialog
        key='user-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      <UsersInviteDialog
        key='user-invite'
        open={open === 'invite'}
        onOpenChange={() => setOpen('invite')}
      />

      {currentRow && (
        <>
          <UsersViewDialog
            key={`user-view-${currentRow.id}`}
            open={open === 'view'}
            onOpenChange={() => {
              setOpen('view')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <UsersStatusDialog
            key={`user-status-${currentRow.id}`}
            open={open === 'status'}
            onOpenChange={(open) => {
              if (!open) {
                setCurrentRow(null)
                setOpen(null)
              } else setOpen('status')
            }}
            currentRow={currentRow}
          />
          <UsersShippingDialog
            key={`user-shipping-${currentRow.id}`}
            open={open === 'shipping'}
            onOpenChange={(open) => {
              if (!open) {
                setCurrentRow(null)
                setOpen(null)
              } else setOpen('shipping')
            }}
            currentRow={currentRow}
          />
          <UsersAssignDialog
            key={`user-assign-${currentRow.id}`}
            open={open === 'assign'}
            onOpenChange={(open) => {
              if (!open) {
                setCurrentRow(null)
                setOpen(null)
              } else setOpen('assign')
            }}
            currentRow={currentRow}
          />
          <UsersDeleteDialog
            key={`user-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
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
