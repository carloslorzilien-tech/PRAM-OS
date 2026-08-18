'use client'

import React from 'react'
import { ClerkProvider } from '@clerk/nextjs'

interface SafeClerkProviderProps {
  children: React.ReactNode
  publishableKey?: string
}

// Personalización visual de Clerk para que use la estética de PRAM OS
const clerkAppearance = {
  variables: {
    colorPrimary: '#152642',
    colorText: '#0F172A',
    colorTextSecondary: '#64748B',
    colorBackground: '#FFFFFF',
    colorInputBackground: '#F8FAFC',
    colorInputText: '#0F172A',
    borderRadius: '0.5rem',
    fontFamily: 'Plus Jakarta Sans, system-ui, -apple-system, sans-serif',
    fontSize: '14px',
  },
  elements: {
    card: 'shadow-xl border border-slate-200 rounded-xl',
    headerTitle: 'text-slate-900 font-bold text-lg',
    headerSubtitle: 'text-slate-500 text-sm',
    socialButtonsBlockButton:
      'border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-medium rounded-lg shadow-sm transition-colors',
    socialButtonsBlockButtonText: 'text-sm font-medium',
    formButtonPrimary:
      'bg-[#152642] hover:bg-[#1e3a5f] text-white font-semibold rounded-lg shadow-sm transition-colors',
    formFieldInput:
      'border-slate-300 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 rounded-lg text-sm',
    footerActionLink: 'text-[#152642] hover:text-[#1e3a5f] font-medium',
    logoBox: 'hidden',
  },
}

export function SafeClerkProvider({ children, publishableKey }: SafeClerkProviderProps) {
  const hasValidClerkKey =
    typeof publishableKey === 'string' &&
    (publishableKey.startsWith('pk_test_') || publishableKey.startsWith('pk_live_'))

  if (!hasValidClerkKey) {
    return (
      <>
        {/* Banner Informativo Discreto de Modo Local */}
        <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-[11px] flex items-center justify-between border-b border-slate-800 print:hidden font-mono">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>PRAM OS V1 · Modo Autónomo Activo (Neon DB Online + Local Auth)</span>
          </div>
          <span className="hidden sm:inline text-slate-400">
            Liceo Minerva Mirabal
          </span>
        </div>
        {children}
      </>
    )
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={clerkAppearance}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProvider>
  )
}
