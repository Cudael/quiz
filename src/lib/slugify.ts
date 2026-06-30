export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function generateUniqueSlug(
  title: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  const base = slugify(title) || 'quiz'
  let candidate = base
  let counter = 2
  while (await checkExists(candidate)) {
    candidate = `${base}-${counter}`
    counter++
  }
  return candidate
}
