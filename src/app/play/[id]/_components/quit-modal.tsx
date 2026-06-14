import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { copy } from '@/lib/copy'

interface QuitModalProps {
  open: boolean
  onClose: () => void
  onQuit: () => void
}

export function QuitModal({ open, onClose, onQuit }: QuitModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={copy.play.quitTitle}
      description={copy.play.quitDescription}
      size="sm"
    >
      <div className="flex gap-3 justify-end mt-2">
        <Button variant="ghost" onClick={onClose}>
          {copy.play.quitCancel}
        </Button>
        <Button variant="destructive" onClick={onQuit}>
          <AlertTriangle className="h-4 w-4" /> {copy.play.quitConfirm}
        </Button>
      </div>
    </Modal>
  )
}
