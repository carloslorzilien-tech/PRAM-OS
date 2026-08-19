'use client'

import React from 'react'
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { LogIn, UserPlus } from 'lucide-react'

interface GoogleAuthButtonProps {
  mode?: 'sign-in' | 'sign-up'
  className?: string
  children?: React.ReactNode
}

/**
 * Botón de autenticación directa 1-Click con Clerk Google OAuth.
 * Utiliza <SignInButton> y <SignUpButton> en mode="modal" para lanzar directamente
 * el selector de cuentas de Google sin formularios previos ni inputs de texto.
 */
export function Google1ClickButton({
  mode = 'sign-in',
  className,
  children,
}: GoogleAuthButtonProps) {
  if (mode === 'sign-up') {
    return (
      <SignUpButton
        mode="modal"
        forceRedirectUrl="/onboarding"
        fallbackRedirectUrl="/onboarding"
      >
        <button
          type="button"
          className={
            className ||
            'inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#152642] hover:bg-[#1e3a5f] transition-all px-3.5 py-2 rounded-lg shadow-sm cursor-pointer'
          }
        >
          {children || (
            <>
              <UserPlus className="size-3.5" />
              <span>Registrarse</span>
            </>
          )}
        </button>
      </SignUpButton>
    )
  }

  return (
    <SignInButton
      mode="modal"
      forceRedirectUrl="/dashboard"
      fallbackRedirectUrl="/dashboard"
    >
      <button
        type="button"
        className={
          className ||
          'inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition-colors px-3 py-2 rounded-lg border border-slate-200 cursor-pointer'
        }
      >
        {children || (
          <>
            <LogIn className="size-3.5 text-slate-600" />
            <span>Iniciar Sesión</span>
          </>
        )}
      </button>
    </SignInButton>
  )
}
