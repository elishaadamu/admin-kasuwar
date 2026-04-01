import { UsersActionDialog } from './users-action-dialog'
import { UsersDeleteDialog } from './users-delete-dialog'
import { UsersInviteDialog } from './users-invite-dialog'
import { useUsers } from './users-provider'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TeamLeadManagement } from './team-lead-management'
import { CreateTeamManagement } from './create-team-management'
import { ZoneLeaderManagement } from './zone-leader-management'
import { RegisterStaffDialog } from './register-staff-dialog'

interface UsersDialogsProps {
  onTeamCreated?: () => void
}

export function UsersDialogs({ onTeamCreated }: UsersDialogsProps) {
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

      {/* Regional Leader Management Dialog */}
      <Dialog
        open={open === 'regional-leader'}
        onOpenChange={(val) => setOpen(val ? 'regional-leader' : null)}
      >
        <DialogContent className='sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Regional Leader Management</DialogTitle>
            <DialogDescription>
              Assign, update, or remove a leader for a geopolitical zone.
            </DialogDescription>
          </DialogHeader>
          <ZoneLeaderManagement onSuccess={() => setOpen(null)} />
        </DialogContent>
      </Dialog>
      
      {/* Create Team Dialog */}
      <Dialog
        open={open === 'create-team'}
        onOpenChange={(val) => setOpen(val ? 'create-team' : null)}
      >
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              Create a new team within a geopolitical zone.
            </DialogDescription>
          </DialogHeader>
          <CreateTeamManagement onSuccess={() => {
            setOpen(null)
            if (onTeamCreated) onTeamCreated()
          }} />
        </DialogContent>
      </Dialog>
      
      <RegisterStaffDialog
        open={open === 'register-staff'}
        onOpenChange={(val) => setOpen(val ? 'register-staff' : null)}
      />

      {currentRow && (
        <>
          <UsersActionDialog
            key={`user-edit-${currentRow.id}`}
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

          <Dialog
            key={`user-lead-${currentRow.id}`}
            open={open === 'lead'}
            onOpenChange={(val) => {
              setOpen(val ? 'lead' : null)
              if (!val) {
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
          >
            <DialogContent className='sm:max-w-xl'>
              <DialogHeader>
                <DialogTitle>Set Team Leader</DialogTitle>
                <DialogDescription>
                  Assign <b>{currentRow.name || `${currentRow.firstName || ''} ${currentRow.lastName || ''}`.trim() || currentRow.username}</b> as a team leader.
                </DialogDescription>
              </DialogHeader>
              <TeamLeadManagement 
                mode='lead' 
                onSuccess={() => setOpen(null)} 
              />
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  )
}
