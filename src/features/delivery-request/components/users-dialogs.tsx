// @ts-nocheck
import { UsersActionDialog } from './users-action-dialog'
import { UsersApproveDialog } from './users-approve-dialog'
import { UsersAssignDialog } from './users-assign-dialog'
import { UsersCancelDialog } from './users-cancel-dialog'
import { UsersDeleteDialog } from './users-delete-dialog'
import { UsersInviteDialog } from './users-invite-dialog'
import { useUsers } from './users-provider'
import { UsersSetPriceDialog } from './users-set-price-dialog'
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
          <UsersActionDialog
            key={`user-edit-${currentRow._id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
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
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <UsersViewDialog
            key={`user-view-${currentRow._id}`}
            open={open === 'view'}
            onOpenChange={() => {
              setOpen('view')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <UsersApproveDialog
            key={`delivery-request-approve-${currentRow._id}`}
            open={open === 'approve'}
            onOpenChange={() => {
              setOpen('approve')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
          />

          <UsersAssignDialog
            key={`delivery-request-assign-${currentRow._id}`}
            open={open === 'assign'}
            onOpenChange={() => {
              setOpen('assign')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
          />

          <UsersCancelDialog
            key={`delivery-request-cancel-${currentRow._id}`}
            open={open === 'cancel'}
            onOpenChange={() => {
              setOpen('cancel')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
          />

          <UsersSetPriceDialog
            key={`delivery-request-set-price-${currentRow._id}`}
            open={open === 'set-price'}
            onOpenChange={() => {
              setOpen('set-price')
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
