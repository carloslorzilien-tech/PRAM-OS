'use client'

import React from 'react'
import Link from 'next/link'
import {
  Award,
  FileCheck,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Loader2,
  LogIn,
} from 'lucide-react'
import { useFirebaseAuth } from '@/lib/firebase-auth'
import { UserProfileBadge } from '@/components/pram/user-profile-card'
import { Google1ClickButton } from '@/components/pram/google-1click-auth'

export default function DashboardHubPage() {
  const { user, userProfile, loading } = useFirebaseAuth()

  // 1. Loading Guard: Wait for initial Firebase Auth token resolution
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-sm w-full text-center">
          <Loader2 className="size-8 animate-spin text-[#152642]" />
          <p className="text-sm font-medium text-slate-600">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  // 2. Unauthenticated Guard: Render login UI if user token resolves to null
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-slate-900 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6 text-center">
          <div className="flex size-12 mx-auto items-center justify-center rounded-2xl bg-slate-100 text-slate-800">
            <LogIn className="size-6 text-[#152642]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Acceso a PRAM OS
            </h2>
            <p className="text-xs text-slate-600 font-normal leading-relaxed">
              Debes iniciar sesión con tu cuenta institucional para ingresar a los módulos de tutoría y auditoría.
            </p>
          </div>
          <div className="pt-2">
            <Google1ClickButton mode="sign-in" className="w-full justify-center h-11 text-xs font-bold bg-[#152642] text-white hover:bg-[#1e3a5f] rounded-xl shadow-xs" />
          </div>
          <div className="pt-4 border-t border-slate-100">
            <Link href="/" className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors">
              ← Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 3. Authenticated State: User resolution complete
  const isDirector =
    userProfile?.rol === 'DIRECTOR' ||
    userProfile?.rol === 'AREA_DIRECTOR' ||
    user.email?.toLowerCase() === 'carlos.lorzilien@gmail.com'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Volver al Portal"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              PRAM OS · Centro de Gestión
            </span>
            <h1 className="text-sm font-semibold tracking-tight text-slate-900 leading-tight">
              Selección de Módulo Operativo
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <UserProfileBadge
            userRole={userProfile?.rol}
            userStatus={userProfile?.status}
            userArea={userProfile?.area}
          />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 space-y-8">
        <div className="text-center space-y-2 max-w-lg mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Acceso a los Paneles de Control
          </h2>
          <p className="text-xs text-slate-600 font-normal">
            Haz clic en el módulo al que deseas ingresar según tu función en el programa educativo.
          </p>
        </div>

        {/* Tarjetas de Selección de Rol Pasivas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Opción 1: Panel del Tutor / Mentor */}
          <Link
            href="/dashboard/mentor"
            className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between space-y-6 group cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <Award className="size-5" />
                </div>
                <span className="rounded-md bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 text-[10px] font-medium">
                  Tutor Académico
                </span>
              </div>

              <div>
                <h3 className="text-base font-semibold tracking-tight text-slate-900 group-hover:text-slate-800">
                  Panel del Tutor
                </h3>
                <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
                  Registro ágil de horas pedagógicas (&lt;30s), seguimiento a la meta de 60 horas y balance de materias (Matemáticas y Lengua Española).
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-semibold text-[#152642]">
              <span>Ingresar al Panel del Tutor</span>
              <ArrowRight className="size-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          {/* Opción 2: Panel de Dirección y Auditoría */}
          <Link
            href="/dashboard/director"
            className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between space-y-6 group cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <FileCheck className="size-5" />
                </div>
                <span className="rounded-md bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 text-[10px] font-medium">
                  Auditoría Académica
                </span>
              </div>

              <div>
                <h3 className="text-base font-semibold tracking-tight text-slate-900 group-hover:text-slate-800">
                  Panel de Dirección
                </h3>
                <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
                  Bandeja de auditoría, aprobación y bloqueo inmutable de sesiones y emisión oficial de certificados CUV.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-semibold text-[#152642]">
              <span>Ingresar al Panel de Dirección</span>
              <ArrowRight className="size-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </div>

        {/* Acceso a Recursos */}
        <div className="p-4 bg-slate-100/80 rounded-xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="size-5 text-slate-600 shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-slate-900">
                Biblioteca de Recursos y Plantillas Imprimibles
              </h4>
              <p className="text-[11px] text-slate-500 font-normal">
                Descarga la plantilla física de asistencia y accede a guías de apoyo pedagógico.
              </p>
            </div>
          </div>
          <Link
            href="/recursos"
            className="text-xs font-medium text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition-colors shrink-0"
          >
            Ver Recursos
          </Link>
        </div>
      </main>
    </div>
  )
}
