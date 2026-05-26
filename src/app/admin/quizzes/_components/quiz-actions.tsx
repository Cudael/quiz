'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { deleteQuiz, toggleQuizPublished } from '../actions'

interface AdminQuizActionsProps {
  quizId: string
  quizTitle: string
  isPublished: boolean
  nextPublish: string
}

export function AdminQuizActions({
  quizId,
  quizTitle,
  isPublished,
  nextPublish,
}: AdminQuizActionsProps) {
  const router = useRouter()
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [publishing, setPublishing] = useState(false)

  async function handlePublish() {
    setPublishing(true)
    try {
      const formData = new FormData()
      formData.set('quizId', quizId)
      formData.set('publish', nextPublish)
      await toggleQuizPublished(formData)
      router.refresh()
    } finally {
      setPublishing(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const formData = new FormData()
      formData.set('quizId', quizId)
      await deleteQuiz(formData)
      setDeleteModalOpen(false)
      router.refresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href={`/quiz/${quizId}`}>View</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={`/studio/quiz/${quizId}/edit`}>Edit</Link>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handlePublish}
          disabled={publishing}
        >
          {isPublished ? 'Unpublish' : 'Publish'}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => setDeleteModalOpen(true)}
        >
          Delete
        </Button>
      </div>

      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete quiz?"
        description={`Are you sure you want to permanently delete "${quizTitle}"? This cannot be undone.`}
        size="sm"
      >
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </>
  )
}
