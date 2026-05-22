'use client'

import { shortcuts } from '@/lib/copy'
import { Modal } from '@/components/ui/modal'

interface ShortcutsCheatsheetProps {
  open: boolean
  onClose: () => void
}

function Row({ keys, description }: { keys: string; description: string }) {
  return (
    <li className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
      <kbd className="rounded bg-muted px-2 py-0.5 font-mono text-xs">{keys}</kbd>
      <span className="text-muted-foreground">{description}</span>
    </li>
  )
}

export function ShortcutsCheatsheet({ open, onClose }: ShortcutsCheatsheetProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Keyboard shortcuts"
      description="Navigate QuizArena fast from anywhere."
      size="lg"
    >
      <div className="space-y-4">
        <section>
          <h3 className="mb-2 text-sm font-semibold">Global</h3>
          <ul className="space-y-2">
            {shortcuts.global.map((item) => (
              <Row
                key={`${item.keys}-${item.description}`}
                keys={item.keys}
                description={item.description}
              />
            ))}
          </ul>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold">During play</h3>
          <ul className="space-y-2">
            {shortcuts.play.map((item) => (
              <Row
                key={`${item.keys}-${item.description}`}
                keys={item.keys}
                description={item.description}
              />
            ))}
          </ul>
        </section>
      </div>
    </Modal>
  )
}
