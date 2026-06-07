import { unstable_cache } from 'next/cache'
import { prisma } from '@/server/prisma'
import { CategoryBarClient } from './category-bar-client'

export const CATEGORY_BAR_TAG = 'category-bar'

const getCategoryBarData = unstable_cache(
  async () => {
    const parentCategories = await prisma.category.findMany({
      where: { parentSlug: null },
      select: {
        slug: true,
        name: true,
        icon: true,
        color: true,
        imageUrl: true,
        _count: { select: { quizzes: { where: { isPublished: true } } } },
      },
    })

    const parentSlugs = parentCategories.map((c) => c.slug)

    // Count published quizzes in subcategories under each parent
    const subcategories = await prisma.category.findMany({
      where: { parentSlug: { in: parentSlugs } },
      select: {
        parentSlug: true,
        _count: { select: { quizzes: { where: { isPublished: true } } } },
      },
    })

    const childCountsByParent = new Map<string, number>()
    for (const sub of subcategories) {
      const parent = sub.parentSlug!
      childCountsByParent.set(parent, (childCountsByParent.get(parent) ?? 0) + sub._count.quizzes)
    }

    const sorted = parentCategories
      .map((cat) => ({
        slug: cat.slug,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        imageUrl: cat.imageUrl,
        quizCount: cat._count.quizzes + (childCountsByParent.get(cat.slug) ?? 0),
      }))
      .sort((a, b) => b.quizCount - a.quizCount)
      // Show ALL categories (no slice)
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
