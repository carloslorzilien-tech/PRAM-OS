import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import {
  Award,
  FileCheck,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  BookOpen,
} from 'lucide-react'
import { getPublicKPIs, getUserByEmail } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function DashboardHubPage() {
  // Auto-detección y redirección según estado en Neon DB
  try {
    const clerkUser = await currentUser()
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress

    if (email) {
      const dbUser = await getUserByEmail(email)

      if (!dbUser) {
        redirect('/onboarding')
      }

      if (dbUser.status === 'PENDING') {
        redirect('/solicitud-pendiente')
      }

      if (dbUser.status === 'APPROVED') {
        if (dbUser.rol === 'DIRECTOR' || dbUser.rol === 'AREA_DIRECTOR') {
          redirect('/dashboard/director')
        } else {
          redirect('/dashboard/mentor')
        }
      }
    }
  } catch (error: any) {
    // Si es NEXT_REDIRECT, permitir que fluya
    if (error?.digest?.startsWith('NEXT_REDIRECT') || error?.message?.includes('NEXT_REDIRECT')) {
      throw error
    }
    // En caso de modo autónomo sin llaves de Clerk, continúa al render
  }

  const kpis = await getPublicKPIs()

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
              Selección de Rol y Módulo Operativo
            </h1>
          </div>
        </div>

        <Link
          href="/"
          className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
        >
          Portal Público
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 space-y-8">
        <div className="text-center space-y-2 max-w-lg mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Acceso al Sistema PRAM OS
          </h2>
          <p className="text-xs text-slate-600 font-normal">
            Selecciona el espacio de trabajo correspondiente a tu función en el programa educativo.
          </p>
        </div>

        {/* Tarjetas de Selección de Rol */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Opción 1: Panel del Tutor / Mentor */}
          <Link
            href="/dashboard/mentor"
            className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between space-y-6 group"
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

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-medium text-slate-900">
              <span>Ingresar al Módulo</span>
              <ArrowRight className="size-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          {/* Opción 2: Panel de Dirección y Auditoría */}
          <Link
            href="/dashboard/director"
            className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between space-y-6 group"
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

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-medium text-slate-900">
              <span>Ingresar al Módulo</span>
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
