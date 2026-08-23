import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, Clock, CheckCircle2 } from 'lucide-react'
import { getOrCreateCurrentUser } from '@/lib/auth-user'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Solicitud Pendiente · PRAM OS',
  description: 'Tu solicitud de acceso está siendo revisada por la administración del Liceo Minerva Mirabal.',
}

export default async function SolicitudPendientePage() {
  // Redirección Inteligente: Si el usuario ya fue aprobado, llevarlo directamente a su dashboard específico
  try {
    const currentUser = await getOrCreateCurrentUser()
    if (currentUser && currentUser.status === 'APPROVED') {
      const target =
        currentUser.rol === 'DIRECTOR' || currentUser.rol === 'AREA_DIRECTOR'
          ? '/dashboard/director'
          : '/dashboard/mentor'
      redirect(target)
    }
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_REDIRECT') || error?.message?.includes('NEXT_REDIRECT')) {
      throw error
    }
    console.error('[PRAM Auth Error in SolicitudPendientePage]:', error)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6 py-12">
        {/* Header con logo */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#152642] p-2.5 shadow-lg">
              <img
                src="/pram-logo.svg"
                alt="PRAM"
                className="size-full object-contain invert brightness-0 contrast-200"
              />
            </div>
          </div>

          {/* Badge de estado */}
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3.5 py-1 text-xs font-semibold text-amber-700">
              <Clock className="size-3.5 animate-pulse" />
              Solicitud en Revisión
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Solicitud Recibida
          </h1>
          <p className="text-sm text-slate-600 font-normal leading-relaxed max-w-xs mx-auto">
            Tu solicitud de acceso al sistema PRAM OS ha sido registrada y está siendo revisada por la dirección del Liceo Minerva Mirabal.
          </p>
        </div>

        {/* Pasos del proceso */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Estado del Proceso
          </span>

          <div className="space-y-2.5">
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              <span className="text-slate-900 font-medium">Cuenta creada con Google</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              <span className="text-slate-900 font-medium">Rol seleccionado</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="size-4 text-amber-500 shrink-0" />
              <span className="text-slate-600">Aprobación por Dirección Académica</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center font-normal">
          Recibirás acceso al panel una vez que tu solicitud sea aprobada.
          Mientras tanto, puedes explorar el portal público.
        </p>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors"
          >
            <ArrowLeft className="size-3" />
            Ir al Portal Público
          </Link>
        </div>
      </div>
    </div>
  )
}
