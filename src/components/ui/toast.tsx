'use client'

import * as React from 'react'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Exit animation duration in ms — must match the `duration-*` class below. */
const EXIT_DURATION_MS = 200

type ToastVariant = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  variant: ToastVariant
  duration?: number
  leaving?: boolean
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (message: string, variant?: ToastVariant, duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

const icons: Record<ToastVariant, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-quiz-green/30 bg-quiz-green/10 text-quiz-green',
  error: 'border-destructive/30 bg-destructive/10 text-destructive',
  info: 'border-quiz-blue/30 bg-quiz-blue/10 text-quiz-blue',
  warning: 'border-quiz-yellow/30 bg-quiz-yellow/10 text-quiz-yellow',
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, EXIT_DURATION_MS)
  }, [])

  const addToast = React.useCallback(
    (message: string, variant: ToastVariant = 'info', duration = 4000) => {
      const id = crypto.randomUUID()
      setToasts((prev) => [...prev, { id, message, variant, duration }])
      setTimeout(() => removeToast(id), duration)
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed inset-x-4 bottom-4 z-50 flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-4 sm:items-end"
      >
        {toasts.map((toast) => {
          const Icon = icons[toast.variant]
          return (
            <div
              key={toast.id}
              className={cn(
                'flex items-center gap-3 rounded-md border px-4 py-3 shadow-lg backdrop-blur-sm w-full sm:min-w-70 sm:max-w-100 sm:w-auto',
                'duration-200',
                toast.leaving
                  ? 'animate-out fade-out-0 slide-out-to-right-4 zoom-out-95'
                  : 'animate-in fade-in-0 slide-in-from-right-4 zoom-in-95',
                variantStyles[toast.variant]
              )}
              role="alert"
            >
              <Icon className="h-5 w-5 shrink-0" />
              <p className="flex-1 text-sm font-medium">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 rounded-full p-0.5 opacity-70 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
