import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <img
      src="/logo.svg"
      alt="BusQuiz"
      className={cn('h-9 w-auto', className)}
      width={319}
      height={84}
      decoding="async"
    />
  )
}
