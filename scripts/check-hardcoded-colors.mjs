import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(process.cwd(), 'src')

const bannedPatterns = [
  /\btext-white(?:\/\d+)?\b/g,
  /\btext-black(?:\/\d+)?\b/g,
  /\bbg-white(?:\/\d+)?\b/g,
  /\bbg-black(?:\/\d+)?\b/g,
  /\btext-gray-[\w-]+\b/g,
  /\bbg-gray-[\w-]+\b/g,
  /\btext-\[#.+?\]\b/g,
]

// Allowlist: intentional contrast on branded gradients and the modal backdrop overlay.
const allowlist = new Set([
  'components/ui/button.tsx',
  'components/ui/category-tile.tsx',
  'components/ui/modal.tsx',
])

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)))
      continue
    }

    if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      files.push(fullPath)
    }
  }

  return files
}

const files = await walk(ROOT)
const violations = []

for (const file of files) {
  const relPath = path.relative(ROOT, file).replaceAll('\\', '/')
  if (allowlist.has(relPath)) continue

  const content = await readFile(file, 'utf8')

  for (const pattern of bannedPatterns) {
    pattern.lastIndex = 0
    const match = pattern.exec(content)
    if (match) {
      violations.push({ file: relPath, token: match[0] })
    }
  }
}

if (violations.length > 0) {
  console.error('Hardcoded non-semantic color classes found:')
  for (const violation of violations) {
    console.error(`- src/${violation.file}: ${violation.token}`)
  }
  console.error('\nIf a usage is intentional, add the file to scripts/check-hardcoded-colors.mjs allowlist with rationale.')
  process.exit(1)
}

console.log('No banned hardcoded color classes found.')
