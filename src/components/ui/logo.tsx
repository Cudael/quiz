import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <span
      aria-label="BusQuiz"
      role="img"
      className={cn('block h-6 w-[7.0625rem] bg-foreground', className)}
      style={{
        mask: 'url(/logo.svg) center / contain no-repeat',
        WebkitMask: 'url(/logo.svg) center / contain no-repeat',
      }}
    />
  )
}
