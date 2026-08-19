import React from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ShieldCheck,
  FileCheck,
  Users,
  Clock,
  CheckCircle2,
  Printer,
  Building,
} from 'lucide-react'
import { getPendingSessionsForAudit, getPublicKPIs, getTopMentores, getPendingUsers } from '@/lib/db'
import { DirectorAuditTable } from '@/components/pram/director-table'
import { currentUser } from '@clerk/nextjs/server'

export const dynamic = 'force-dynamic'

export default async function DirectorDashboardPage() {
  const pendingSessions = await getPendingSessionsForAudit()
  const pendingUsers = await getPendingUsers()
  const kpis = await getPublicKPIs()
  const topMentores = await getTopMentores(5)

  let directorName = 'Director Académico'
  try {
    const clerkUser = await currentUser()
    if (clerkUser) {
      directorName = clerkUser.fullName || clerkUser.firstName || clerkUser.emailAddresses?.[0]?.emailAddress || 'Director Académico'
    }
  } catch { /* modo autónomo */ }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-8 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Volver al Portal"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                PRAM OS · Panel de Dirección y Auditoría
              </span>
            </div>
            <h1 className="text-sm font-semibold tracking-tight text-slate-900 leading-tight">
              {directorName} · Panel de Dirección y Auditoría
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/director/solicitudes"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 bg-amber-50 border border-amber-300 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors shadow-xs"
          >
            <Users className="size-3.5 text-amber-700" />
            <span>Solicitudes</span>
            {pendingUsers.length > 0 && (
              <span className="rounded-full bg-amber-600 text-white px-1.5 py-0.2 text-[10px] font-bold">
                {pendingUsers.length}
              </span>
            )}
          </Link>
          <Link
            href="/dashboard/mentor"
            className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
          >
            Ir a Panel Tutor
          </Link>
        </div>
      </header>

      {/* Cabecera Imprimible (Solo visible en Print) */}
      <div className="hidden print:block p-8 border-b border-slate-300 text-center space-y-2">
        <h1 className="text-xl font-bold text-slate-900 uppercase">
          Liceo Minerva Mirabal · Sistema de Refuerzo Académico
        </h1>
        <h2 className="text-sm font-semibold text-slate-700">
          Programa de Refuerzo Académico Minerva Mirabal (PRAM OS) — Expediente de Auditoría
        </h2>
        <p className="text-xs text-slate-500">
          Fecha de Emisión: {new Date().toLocaleDateString('es-DO')} · Liceo Minerva Mirabal
        </p>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        {/* 1. KPIs del Director */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 print:grid-cols-4">
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Horas Validadas
            </span>
            <p className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              {kpis.horasCertificadas} <span className="text-lg font-normal text-slate-500">h</span>
            </p>
            <p className="text-[11px] font-medium text-emerald-700 mt-1">
              Bloqueadas e Inmutables
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pendientes Firma
            </span>
            <p className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              {pendingSessions.length}
            </p>
            <p className="text-[11px] font-medium text-amber-700 mt-1">
              En bandeja de espera
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Alumnos Atendidos
            </span>
            <p className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              {kpis.estudiantesAtendidos}
            </p>
            <p className="text-[11px] font-normal text-slate-500 mt-1">
              En cohortes activas
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sesiones Aprobadas
            </span>
            <p className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              {kpis.sesionesValidadas}
            </p>
            <p className="text-[11px] font-normal text-slate-500 mt-1">
              Acreditadas
            </p>
          </div>
        </section>

        {/* 2. Tabla de Auditoría con Aprobación */}
        <section className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
          <DirectorAuditTable initialSessions={pendingSessions} />
        </section>

        {/* 3. Expediente Resumido de Mentores (Apto para Impresión) */}
        <section className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-slate-900">
                Resumen de Cumplimiento de Mentores
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                Registro oficial para la emisión de certificados de 60 horas
              </p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Distrito 08-03
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Mentor</th>
                  <th className="px-4 py-2.5">Especialidad</th>
                  <th className="px-4 py-2.5">Horas Acumuladas</th>
                  <th className="px-4 py-2.5">Meta (60h)</th>
                  <th className="px-4 py-2.5 text-right">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {topMentores.map((m) => {
                  const isComplete = m.horas_acumuladas >= m.meta_horas
                  return (
                    <tr key={m.id}>
                      <td className="px-4 py-2.5 font-medium text-slate-900">{m.nombre}</td>
                      <td className="px-4 py-2.5 text-slate-600">{m.especialidad}</td>
                      <td className="px-4 py-2.5 font-mono font-bold text-slate-900">{m.horas_acumuladas.toFixed(1)} h</td>
                      <td className="px-4 py-2.5 font-mono text-slate-500">{m.meta_horas.toFixed(0)} h</td>
                      <td className="px-4 py-2.5 text-right">
                        {isComplete ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-medium">
                            <CheckCircle2 className="size-3 text-emerald-600" />
                            <span>Listo para Certificar</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 text-[10px] font-medium">
                            <span>En Progreso</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
