import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'

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
      title="Quit Quiz?"
      description="Your progress will be lost."
      size="sm"
    >
      <div className="flex gap-3 justify-end mt-2">
        <Button variant="ghost" onClick={onClose}>
          Keep Playing
        </Button>
        <Button variant="destructive" onClick={onQuit}>
          <AlertTriangle className="h-4 w-4" /> Quit
        </Button>
      </div>
    </Modal>
  )
}
