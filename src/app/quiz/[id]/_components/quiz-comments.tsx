import { prisma } from '@/server/prisma'
import { auth } from '@/server/auth'
import { CommentThread, type CommentNode } from './comment-thread'

const COMMENT_AUTHOR_SELECT = {
  id: true,
  name: true,
  username: true,
  image: true,
  role: true,
} as const

export async function QuizComments({
  quizId,
  quizAuthorId,
}: {
  quizId: string
  quizAuthorId: string | null
}) {
  const session = await auth()

  const comments = await prisma.quizComment.findMany({
    where: { quizId, parentId: null, isHidden: false },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      body: true,
      createdAt: true,
      author: { select: COMMENT_AUTHOR_SELECT },
      replies: {
        where: { isHidden: false },
        orderBy: { createdAt: 'asc' },
        take: 20,
        select: {
          id: true,
          body: true,
          createdAt: true,
          author: { select: COMMENT_AUTHOR_SELECT },
        },
      },
    },
  })

  const toNode = (c: {
    id: string
    body: string
    createdAt: Date
    author: {
      id: string
      name: string | null
      username: string | null
      image: string | null
      role: string
    }
  }): CommentNode => ({
    id: c.id,
    body: c.body,
    createdAt: c.createdAt.toISOString(),
    author: {
      id: c.author.id,
      name: c.author.name,
      username: c.author.username,
      image: c.author.role === 'ADMIN' ? null : c.author.image,
    },
    replies: [],
  })

  const nodes: CommentNode[] = comments.map((c) => ({
    ...toNode(c),
    replies: c.replies.map(toNode),
  }))

  return (
    <CommentThread
      quizId={quizId}
      comments={nodes}
      viewer={
        session?.user?.id
          ? {
              id: session.user.id,
              isAdmin: session.user.role === 'ADMIN',
              isQuizAuthor: session.user.id === quizAuthorId,
            }
          : null
      }
    />
  )
}
