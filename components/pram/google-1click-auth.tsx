'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogIn, UserPlus, LayoutDashboard, Loader2 } from 'lucide-react'
import { useFirebaseAuth } from '@/lib/firebase-auth'

interface GoogleAuthButtonProps {
  mode?: 'sign-in' | 'sign-up'
  className?: string
  children?: React.ReactNode
}

/**
 * Botón de autenticación Google 1-Click con Firebase Auth (signInWithPopup).
 */
export function Google1ClickButton({
  mode = 'sign-in',
  className,
  children,
}: GoogleAuthButtonProps) {
  const { user, userProfile, signInWithGoogle } = useFirebaseAuth()
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const router = useRouter()

  // Si ya está autenticado, enlace directo a su dashboard
  if (user) {
    const dashboardUrl =
      userProfile?.rol === 'DIRECTOR' || user.email === 'carlos.lorzilien@gmail.com'
        ? '/dashboard/director'
        : '/dashboard/mentor'

    return (
      <Link
        href={dashboardUrl}
        className={
          className ||
          'inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#152642] hover:bg-[#1e3a5f] transition-all px-3.5 py-2 rounded-lg shadow-sm cursor-pointer'
        }
      >
        <LayoutDashboard className="size-3.5 text-slate-200" />
        <span>Ir al Dashboard</span>
      </Link>
    )
  }

  const handleAuth = async () => {
    try {
      setIsLoggingIn(true)
      const profile = await signInWithGoogle()
      if (profile) {
        const targetUrl =
          profile.rol === 'DIRECTOR' || profile.email === 'carlos.lorzilien@gmail.com'
            ? '/dashboard/director'
            : '/dashboard/mentor'
        router.push(targetUrl)
      }
    } catch (error) {
      console.error('Error during Google sign-in:', error)
    } finally {
      setIsLoggingIn(false)
    }
  }

  if (mode === 'sign-up') {
    return (
      <button
        type="button"
        onClick={handleAuth}
        disabled={isLoggingIn}
        className={
          className ||
          'inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#152642] hover:bg-[#1e3a5f] transition-all px-3.5 py-2 rounded-lg shadow-sm cursor-pointer disabled:opacity-70'
        }
      >
        {isLoggingIn ? (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            <span>Conectando...</span>
          </>
        ) : (
          children || (
            <>
              <UserPlus className="size-3.5" />
              <span>Registrarse con Google</span>
            </>
          )
        )}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleAuth}
      disabled={isLoggingIn}
      className={
        className ||
        'inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition-colors px-3 py-2 rounded-lg border border-slate-200 cursor-pointer disabled:opacity-70'
      }
    >
      {isLoggingIn ? (
        <>
          <Loader2 className="size-3.5 animate-spin" />
          <span>Iniciando...</span>
        </>
      ) : (
        children || (
          <>
            <LogIn className="size-3.5 text-slate-600" />
            <span>Iniciar Sesión con Google</span>
          </>
        )
      )}
    </button>
  )
}
