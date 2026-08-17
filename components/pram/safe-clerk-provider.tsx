'use client'

import React from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import { ShieldAlert } from 'lucide-react'

interface SafeClerkProviderProps {
  children: React.ReactNode
  publishableKey?: string
}

export function SafeClerkProvider({ children, publishableKey }: SafeClerkProviderProps) {
  // Solo activar ClerkProvider si la clave empieza con pk_test_ o pk_live_
  const hasValidClerkKey =
    typeof publishableKey === 'string' &&
    (publishableKey.startsWith('pk_test_') || publishableKey.startsWith('pk_live_'))

  if (!hasValidClerkKey) {
    return (
      <>
        {/* Banner Informativo Discreto de Modo Local / Fallback */}
        <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-[11px] flex items-center justify-between border-b border-slate-800 print:hidden font-mono">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>PRAM OS V1 · Modo Autónomo Activo (Neon DB Online + Local Auth)</span>
          </div>
          <span className="hidden sm:inline text-slate-400">
            Liceo Minerva Mirabal · MINERD
          </span>
        </div>
        {children}
      </>
    )
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      {children}
    </ClerkProvider>
  )
}
