'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/** Arcade-style press: solid buttons sit on a hard 3px ledge and physically
 *  push down when clicked — crisp and tactile, no soft glows. */
const pressable = 'active:translate-y-[3px] active:shadow-none'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: `bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_3px_0_0_hsl(var(--primary)/0.3)] ${pressable}`,
        destructive: `bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[0_3px_0_0_hsl(var(--destructive)/0.4)] ${pressable}`,
        outline:
          'border border-foreground/25 bg-transparent hover:bg-foreground/10 active:scale-95',
        secondary: 'bg-foreground/10 text-foreground hover:bg-foreground/20 active:scale-95',
        ghost: 'hover:bg-foreground/10 active:scale-95',
        link: 'text-foreground underline-offset-4 hover:underline',
        accent: `bg-quiz-purple text-white hover:bg-quiz-purple/90 shadow-[0_3px_0_0_var(--color-quiz-purple-dark)] ${pressable}`,
        warm: `bg-quiz-orange text-white hover:bg-quiz-orange/90 shadow-[0_3px_0_0_var(--color-quiz-orange-dark)] ${pressable}`,
        success: `bg-quiz-green text-white hover:bg-quiz-green/90 shadow-[0_3px_0_0_var(--color-quiz-green-dark)] ${pressable}`,
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-md px-8 text-base',
        xl: 'h-14 rounded-md px-10 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
