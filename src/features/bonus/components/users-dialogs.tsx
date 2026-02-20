// @ts-nocheck
import { BannerActionDialog } from './banner-action-dialog'
import { UsersDeleteDialog } from './users-delete-dialog'
import { useUsers } from './users-provider'
import { RewardConfigDialog } from './reward-config-dialog'

export function UsersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers()
  
  return (
    <>
      <BannerActionDialog
        key='user-add'
        open={open === 'add' || open === 'invite'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'add' : null)}
      />
      
      <RewardConfigDialog
        key='reward-config'
        open={open === 'reward-config'}
        onOpenChange={(isOpen) => {
          setOpen(isOpen ? 'reward-config' : null)
          if (!isOpen) {
            // Delay clearing to allow transition to finish
            setTimeout(() => setCurrentRow(null), 500)
          }
        }}
      />

      {currentRow && (
        <>
          <BannerActionDialog
            key={`user-edit-${currentRow._id}`}
            open={open === 'edit'}
            onOpenChange={(isOpen) => {
               setOpen(isOpen ? 'edit' : null)
               if(!isOpen) setTimeout(() => setCurrentRow(null), 500)
            }}
            currentRow={currentRow}
          />

          <UsersDeleteDialog
            key={`user-delete-${currentRow._id}`}
            open={open === 'delete'}
            onOpenChange={(isOpen) => {
                setOpen(isOpen ? 'delete' : null)
                if(!isOpen) setTimeout(() => setCurrentRow(null), 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
