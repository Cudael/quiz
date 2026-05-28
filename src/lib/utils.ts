import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function withAlphaColor(color: string, alpha: number) {
  const hex = color.trim()
  const shortMatch = /^#([a-fA-F0-9]{3})$/.exec(hex)
  const fullMatch = /^#([a-fA-F0-9]{6})$/.exec(hex)

  if (!shortMatch && !fullMatch) return color

  const normalized = shortMatch
    ? shortMatch[1]
        .split('')
        .map((part) => part + part)
        .join('')
    : fullMatch![1]
  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}
