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

    // Calculate total play count and sort by popularity
    const categoriesWithStats = categories
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
        // Sort by total plays first (popularity), then by quiz count
        if (a.totalPlayCount !== b.totalPlayCount) {
          return b.totalPlayCount - a.totalPlayCount
        }
        return b.quizCount - a.quizCount
      })

    // Return ALL categories (no slice)
    return categoriesWithStats.map(({ slug, name, icon, color, imageUrl, quizCount, totalPlayCount }) => ({
      slug,
      name,
      icon,
      color,
      imageUrl: imageUrl ?? undefined,
      quizCount,
      totalPlayCount,
    }))
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
