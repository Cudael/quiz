import { unstable_cache } from 'next/cache'
import { prisma } from '@/server/prisma'
import { CategoryBarClient } from './category-bar-client'

export const CATEGORY_BAR_TAG = 'category-bar'

const getCategoryBarData = unstable_cache(
  async () => {
    const categories = await prisma.category.findMany({
      where: { parentSlug: null },
      select: {
        slug: true,
        name: true,
        icon: true,
        color: true,
        imageUrl: true,
        quizzes: {
          where: { isPublished: true },
          select: { playCount: true },
        },
      },
    })

    const sorted = categories
      .map((cat) => ({
        slug: cat.slug,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        imageUrl: cat.imageUrl,
        totalPlayCount: cat.quizzes.reduce((sum, q) => sum + q.playCount, 0),
        quizCount: cat.quizzes.length,
      }))
      .sort((a, b) => {
        const byPlay = b.totalPlayCount - a.totalPlayCount
        if (byPlay !== 0) return byPlay
        return b.quizCount - a.quizCount
      })
      .slice(0, 8)
      .map(({ slug, name, icon, color, imageUrl, quizCount }) => ({
        slug,
        name,
        icon,
        color,
        imageUrl: imageUrl ?? undefined,
        quizCount,
      }))

    return sorted
  },
  ['category-bar'],
  {
    revalidate: 3600,
    tags: [CATEGORY_BAR_TAG],
  }
)

export async function CategoryBar() {
  const categories = await getCategoryBarData()
  return <CategoryBarClient categories={categories} />
}
