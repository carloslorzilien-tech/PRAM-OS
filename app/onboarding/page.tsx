'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { OnboardingForm } from '@/components/pram/onboarding-form'
import { useFirebaseAuth } from '@/lib/firebase-auth'

export default function OnboardingPage() {
  const { user, userProfile, loading } = useFirebaseAuth()
  const router = useRouter()

  // Si el usuario ya está aprobado, redirigir a su panel
  React.useEffect(() => {
    if (!loading && userProfile?.status === 'APPROVED') {
      const isDirector = userProfile.rol === 'DIRECTOR' || userProfile.rol === 'AREA_DIRECTOR'
      router.replace(isDirector ? '/dashboard/director' : '/dashboard/mentor')
    }
  }, [loading, userProfile, router])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="size-7 animate-spin" />
          <p className="text-xs font-medium">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario autenticado, redirigir a la home
  if (!user) {
    router.replace('/')
    return null
  }

  // Leer datos reales del usuario autenticado
  const email = user.email || ''
  const nombre = user.displayName || userProfile?.nombre || email.split('@')[0] || 'Usuario PRAM'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex items-center justify-center px-4 py-10">
      <div className="max-w-lg w-full space-y-6 text-center">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#152642] p-2.5 shadow-lg">
              <img
                src="/pram-logo.svg"
                alt="PRAM"
                className="size-full object-contain invert brightness-0 contrast-200"
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Registro de Perfil Institucional
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed max-w-sm mx-auto">
            Configura tu rol institucional para vincular tu cuenta a la base de datos oficial del Liceo Minerva Mirabal.
          </p>
        </div>

        {/* Formulario — recibe email y nombre reales del usuario autenticado */}
        <OnboardingForm email={email} nombre={nombre} />

        <div className="text-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors"
          >
            <ArrowLeft className="size-3" />
            Volver al Portal Público
          </Link>
        </div>
      </div>
    </div>
  )
}

