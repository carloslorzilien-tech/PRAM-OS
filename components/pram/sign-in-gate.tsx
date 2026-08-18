'use client'

import React, { useState } from 'react'
import { LogIn, X } from 'lucide-react'

/**
 * SignInGate — CTA orgánico para acciones protegidas
 *
 * Envuelve cualquier botón protegido. Si el usuario no está autenticado,
 * muestra un modal sutil invitándolo a iniciar sesión con Google.
 * Nunca muestra páginas rojas, errores 403 ni alertas de seguridad.
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
  const [showPrompt, setShowPrompt] = useState(false)

  if (isSignedIn) {
    return <>{children}</>
  }

  return (
    <>
      <div
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setShowPrompt(true)
        }}
        className="cursor-pointer"
      >
        {children}
      </div>

      {/* Modal sutil de inicio de sesión */}
      {showPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Header con logo */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-[#152642] p-1.5 shadow-sm">
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
                  <span className="text-[10px] text-slate-500 font-medium block">
                    Acceso Requerido
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrompt(false)}
                className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Cerrar"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Mensaje */}
            <p className="text-sm text-slate-600 font-normal leading-relaxed">
              {message}
            </p>

            {/* Botón principal: Continuar con Google */}
            <a
              href="/sign-in"
              className="flex w-full items-center justify-center gap-2.5 rounded-lg bg-[#152642] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1e3a5f] transition-colors shadow-sm"
            >
              <svg className="size-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continuar con Google</span>
            </a>

            {/* Texto secundario */}
            <p className="text-[11px] text-slate-400 text-center font-normal">
              Tu cuenta queda vinculada al sistema del Liceo Minerva Mirabal
            </p>
          </div>
        </div>
      )}
    </>
  )
}
