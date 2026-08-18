import React from 'react'
import Link from 'next/link'
import {
  Award,
  FileCheck,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Users,
  GraduationCap,
} from 'lucide-react'
import { getPublicKPIs } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function DashboardHubPage() {
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
          {/* Opción 1: Tutor / Mentor */}
          <Link
            href="/dashboard/mentor"
            className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-400 hover:shadow-md transition-all space-y-4 group block"
          >
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                <Award className="size-5" />
              </div>
              <span className="rounded-md bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 text-[10px] font-medium">
                Tutoría & Servicio
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-slate-800 flex items-center justify-between">
                <span>Panel del Tutor</span>
                <ArrowRight className="size-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
                Registro rápido de sesiones de refuerzo, seguimiento del progreso hacia las 60 horas y consulta de estado de aprobación.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Formularios &lt; 30 seg</span>
              <span className="text-slate-900 font-semibold">Acceder →</span>
            </div>
          </Link>

          {/* Opción 2: Director / Auditor */}
          <Link
            href="/dashboard/director"
            className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-400 hover:shadow-md transition-all space-y-4 group block"
          >
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                <FileCheck className="size-5" />
              </div>
              <span className="rounded-md bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 text-[10px] font-medium">
                Auditoría MINERD
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-slate-800 flex items-center justify-between">
                <span>Panel de Dirección</span>
                <ArrowRight className="size-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
                Revisión, aprobación y bloqueo inmutable de horas de tutoría con generación de expedientes institucionales imprimibles.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Firma y validación</span>
              <span className="text-slate-900 font-semibold">Acceder →</span>
            </div>
          </Link>
        </div>

        {/* Acceso a Recursos */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="size-5 text-slate-700" />
            <div>
              <h4 className="text-xs font-semibold text-slate-900">
                Biblioteca de Recursos y Plantillas Imprimibles
              </h4>
              <p className="text-[11px] text-slate-500 font-normal">
                Descarga la plantilla física de asistencia y accede a guías curriculares del MINERD.
              </p>
            </div>
          </div>
          <Link
            href="/recursos"
            className="text-xs font-medium text-slate-900 hover:underline shrink-0 whitespace-nowrap ml-4"
          >
            Ver recursos →
          </Link>
        </div>
      </main>
    </div>
  )
}
