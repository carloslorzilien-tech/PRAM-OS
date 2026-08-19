'use client'

import React from 'react'
import { ClerkProvider } from '@clerk/nextjs'

interface SafeClerkProviderProps {
  children: React.ReactNode
  publishableKey?: string
}

// Personalización visual de Clerk para que use la estética institucional de PRAM OS
export const pramClerkAppearance = {
  layout: {
    socialButtonsPlacement: 'top' as const,
    socialButtonsVariant: 'blockButton' as const,
    logoPlacement: 'inside' as const,
    showOptionalFields: false,
  },
  variables: {
    colorPrimary: '#152642',
    colorText: '#0F172A',
    colorTextSecondary: '#64748B',
    colorBackground: '#FFFFFF',
    colorInputBackground: '#F8FAFC',
    colorInputText: '#0F172A',
    borderRadius: '0.75rem',
    fontFamily: 'Plus Jakarta Sans, system-ui, -apple-system, sans-serif',
    fontSize: '14px',
  },
  elements: {
    rootBox: 'w-full max-w-md mx-auto',
    card: 'shadow-2xl border border-slate-200/90 rounded-2xl bg-white p-6 sm:p-8',
    headerTitle: 'text-slate-900 font-bold text-xl tracking-tight text-center',
    headerSubtitle: 'text-slate-500 text-xs font-normal text-center mt-1',
    socialButtonsBlockButton:
      'border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 font-semibold rounded-xl shadow-sm transition-all h-12 flex items-center justify-center gap-2 hover:border-slate-400 cursor-pointer',
    socialButtonsBlockButtonText: 'text-sm font-semibold text-slate-900 font-sans',
    socialButtonsBlockButtonLogo: 'size-5',
    formButtonPrimary:
      'bg-[#152642] hover:bg-[#1e3a5f] text-white font-semibold rounded-xl shadow-sm transition-all h-12 text-sm cursor-pointer',
    formFieldLabel: 'text-xs font-semibold text-slate-700 uppercase tracking-wider',
    formFieldInput:
      'border-slate-300 focus:ring-2 focus:ring-[#152642]/10 focus:border-[#152642] rounded-xl text-xs sm:text-sm bg-slate-50/50 h-11',
    footerActionLink: 'text-[#152642] hover:text-[#1e3a5f] font-semibold text-xs transition-colors',
    footerActionText: 'text-xs text-slate-500',
    footer: 'border-t border-slate-100 mt-4 pt-4 text-center',
    logoBox: 'hidden',
    dividerLine: 'bg-slate-200',
    dividerText: 'text-xs text-slate-400 font-medium uppercase tracking-wider',
    identityPreview: 'bg-slate-50 border border-slate-200 rounded-xl p-3',
    identityPreviewText: 'text-xs font-semibold text-slate-900',
    identityPreviewEditButtonIcon: 'text-slate-500 hover:text-slate-900',
    userButtonAvatarBox: 'size-8 rounded-lg border border-slate-300',
    userButtonPopoverCard: 'rounded-xl shadow-2xl border border-slate-200 bg-white p-2',
    userPreviewMainIdentifier: 'font-semibold text-slate-900 text-sm',
    userPreviewSecondaryIdentifier: 'text-xs text-slate-500',
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
      appearance={pramClerkAppearance}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProvider>
  )
}
