'use client'

import React, { useState } from 'react'
import { LogIn, UserPlus, X } from 'lucide-react'
import { Google1ClickButton } from '@/components/pram/google-1click-auth'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode?: 'sign-in' | 'sign-up'
  title?: string
  message?: string
}

export function GoogleAuthModal({
  isOpen,
  onClose,
  mode = 'sign-in',
  title,
  message,
}: AuthModalProps) {
  if (!isOpen) return null

  const modalTitle = title || (mode === 'sign-up' ? 'Crear Cuenta en PRAM OS' : 'Acceso Institucional PRAM OS')
  const modalMessage = message || (mode === 'sign-up'
    ? 'Únete como tutor o estudiante en el programa del Liceo Minerva Mirabal con tu cuenta de Google.'
    : '¿Eres mentor o estudiante de PRAM OS? Inicia sesión con Google para acceder a las funciones del sistema.')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 sm:p-7 space-y-4 animate-in zoom-in-95 duration-200">
        {/* Header con logo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#152642] p-1.5 shadow-sm">
              <img
                src="/pram-logo.svg"
                alt="PRAM"
                className="size-full object-contain invert brightness-0 contrast-200"
              />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block leading-tight">
                PRAM OS
              </span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider font-mono block">
                Liceo Minerva Mirabal
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="size-4" />
          </button>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 leading-snug">
            {modalTitle}
          </h3>
          <p className="text-xs text-slate-600 font-normal leading-relaxed mt-1">
            {modalMessage}
          </p>
        </div>

        {/* Botón directo 1-Click con Google */}
        <Google1ClickButton
          mode={mode}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#152642] hover:bg-[#1e3a5f] px-4 py-3 text-xs font-semibold text-white transition-all shadow-sm group cursor-pointer"
        >
          <svg className="size-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>{mode === 'sign-up' ? 'Registrarse con Google' : 'Continuar con Google'}</span>
        </Google1ClickButton>

        {/* Footer info */}
        <p className="text-[11px] text-slate-400 text-center font-normal pt-1 border-t border-slate-100">
          Autenticación segura vinculada a tu cuenta de Google.
        </p>
      </div>
    </div>
  )
}

/**
 * SignInGate — CTA orgánico para acciones protegidas
 */
export function SignInGate({
  children,
  isSignedIn = false,
  message = '¿Eres mentor o estudiante de PRAM OS? Inicia sesión con Google para acceder a esta función.',
}: {
  children: React.ReactNode
  isSignedIn?: boolean
  message?: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  if (isSignedIn) {
    return <>{children}</>
  }

  return (
    <>
      <div
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen(true)
        }}
        className="cursor-pointer"
      >
        {children}
      </div>

      <GoogleAuthModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        mode="sign-in"
        message={message}
      />
    </>
  )
}
