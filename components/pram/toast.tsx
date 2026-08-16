'use client'

import React, { useState, useCallback } from 'react'
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
}

// Global toast state (simple singleton for demo; for production use zustand or context)
let toastListeners: ((toasts: Toast[]) => void)[] = []
let currentToasts: Toast[] = []

function notifyListeners() {
  toastListeners.forEach((fn) => fn([...currentToasts]))
}

export function showToast(type: ToastType, title: string, message?: string) {
  const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const toast: Toast = { id, type, title, message }
  currentToasts = [toast, ...currentToasts].slice(0, 4)
  notifyListeners()
  setTimeout(() => {
    currentToasts = currentToasts.filter((t) => t.id !== id)
    notifyListeners()
  }, 4000)
}

const toastConfig: Record<ToastType, { icon: React.ElementType; bg: string; border: string; text: string; iconColor: string }> = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-900',
    iconColor: 'text-emerald-600',
  },
  error: {
    icon: XCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-900',
    iconColor: 'text-red-600',
  },
  warning: {
    icon: AlertCircle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-900',
    iconColor: 'text-amber-600',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    iconColor: 'text-blue-600',
  },
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  React.useEffect(() => {
    const listener = (updated: Toast[]) => setToasts(updated)
    toastListeners.push(listener)
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== listener)
    }
  }, [])

  const dismiss = useCallback((id: string) => {
    currentToasts = currentToasts.filter((t) => t.id !== id)
    notifyListeners()
  }, [])

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-24 right-4 z-[100] flex flex-col gap-2 md:bottom-6 md:right-6"
      aria-live="polite"
      aria-label="Notificaciones"
    >
      {toasts.map((toast) => {
        const config = toastConfig[toast.type]
        const Icon = config.icon
        return (
          <div
            key={toast.id}
            className={cn(
              'flex items-start gap-3 rounded-2xl border p-4 shadow-lg backdrop-blur-sm w-[300px] sm:w-[340px]',
              config.bg,
              config.border,
              'animate-in slide-in-from-right-4 fade-in duration-300'
            )}
            style={{ animation: 'toastIn 0.3s ease-out' }}
          >
            <style>{`@keyframes toastIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }`}</style>
            <Icon className={cn('size-5 shrink-0 mt-0.5', config.iconColor)} />
            <div className="flex-1 min-w-0">
              <p className={cn('text-xs font-bold', config.text)}>{toast.title}</p>
              {toast.message && (
                <p className={cn('text-[11px] mt-0.5 font-medium opacity-80', config.text)}>{toast.message}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className={cn('shrink-0 rounded-lg p-1 transition-colors hover:bg-black/5 cursor-pointer', config.iconColor)}
              aria-label="Cerrar"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
