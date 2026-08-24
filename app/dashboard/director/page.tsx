import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react'
import {
  getPendingSessionsForAudit,
  getPublicKPIs,
  getTopMentores,
  getPendingUsers,
  Sesion,
  Usuario,
  Mentor,
  withRetry,
} from '@/lib/db'
import { DirectorAuditTable } from '@/components/pram/director-table'
import { getOrCreateCurrentUser } from '@/lib/auth-user'
import { UserProfileBadge } from '@/components/pram/user-profile-card'

export const dynamic = 'force-dynamic'

export default async function DirectorDashboardPage() {
  let currentUser: Usuario | null = null
  let pendingSessions: Sesion[] = []
  let pendingUsers: Usuario[] = []
  let kpis = { horasCertificadas: 0, estudiantesAtendidos: 0, sesionesValidadas: 0, tasaAsistencia: 100 }
  let topMentores: Mentor[] = []
  let isOfflineMode = false

  try {
    currentUser = await getOrCreateCurrentUser()

    if (currentUser && currentUser.status === 'PENDING') {
      redirect('/solicitud-pendiente')
    }

    // Carga protegida con retry ante Cold Starts de Neon DB
    const results = await Promise.allSettled([
      withRetry(() => getPendingSessionsForAudit(), 3, 1500),
      withRetry(() => getPendingUsers(), 3, 1500),
      withRetry(() => getPublicKPIs(), 3, 1500),
      withRetry(() => getTopMentores(5), 3, 1500),
    ])

    if (results[0].status === 'fulfilled' && results[0].value) pendingSessions = results[0].value
    if (results[1].status === 'fulfilled' && results[1].value) pendingUsers = results[1].value
    if (results[2].status === 'fulfilled' && results[2].value) kpis = results[2].value
    if (results[3].status === 'fulfilled' && results[3].value) topMentores = results[3].value
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_REDIRECT') || error?.message?.includes('NEXT_REDIRECT')) {
      throw error
    }
    console.error('Error en Director Dashboard:', error)
    isOfflineMode = true
  }

  // Si el usuario autenticado es explícitamente un MENTOR (no director), mostrar aviso pasivo sin redirección en bucle
  const isDirector =
    currentUser?.rol === 'DIRECTOR' ||
    currentUser?.rol === 'AREA_DIRECTOR' ||
    currentUser?.email?.toLowerCase() === 'carlos.lorzilien@gmail.com'

  if (currentUser && !isDirector && currentUser.rol === 'MENTOR') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 text-center">
          <div className="flex size-12 mx-auto items-center justify-center rounded-xl bg-amber-100 text-amber-800">
            <ShieldAlert className="size-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Módulo de Dirección Académica
            </h2>
            <p className="text-xs text-slate-600 font-normal mt-1">
              Tu cuenta ({currentUser.email}) está registrada con el rol de <strong>Tutor / Mentor</strong>.
              El acceso a la auditoría está reservado para la Dirección.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/dashboard/mentor"
              className="inline-flex w-full items-center justify-center gap-2 bg-[#152642] hover:bg-[#1e3a5f] text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-xs"
            >
              <span>Ir a Mi Panel del Tutor</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const directorName = currentUser?.nombre || 'Director Académico'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Alerta de Modo Desconectado si aplica */}
      {isOfflineMode && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-xs px-4 py-2 flex items-center justify-center gap-2 font-medium">
          <AlertTriangle className="size-4 text-amber-600 shrink-0" />
          <span>Modo desconectado: mostrando vista base. Se reestablecerá automáticamente al reconectar.</span>
        </div>
      )}

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
              {directorName} · Dirección Académica
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/director/solicitudes"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 bg-amber-50 border border-amber-300 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors shadow-xs"
          >
            <Users className="size-3.5 text-amber-700" />
            <span>Solicitudes</span>
            {(pendingUsers || []).length > 0 && (
              <span className="rounded-full bg-amber-600 text-white px-1.5 py-0.2 text-[10px] font-bold">
                {(pendingUsers || []).length}
              </span>
            )}
          </Link>
          <UserProfileBadge
            userRole={currentUser?.rol}
            userStatus={currentUser?.status}
            userArea={currentUser?.area}
          />
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
              {kpis?.horasCertificadas || 0} <span className="text-lg font-normal text-slate-500">h</span>
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
              {(pendingSessions || []).length}
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
              {kpis?.estudiantesAtendidos || 0}
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
              {kpis?.sesionesValidadas || 0}
            </p>
            <p className="text-[11px] font-normal text-slate-500 mt-1">
              Acreditadas
            </p>
          </div>
        </section>

        {/* 2. Tabla de Auditoría con Aprobación */}
        <section className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
          <DirectorAuditTable initialSessions={pendingSessions || []} />
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
                {(topMentores || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center text-slate-400">
                      No hay mentores registrados aún
                    </td>
                  </tr>
                ) : (
                  (topMentores || []).map((m) => {
                    const isComplete = (m?.horas_acumuladas || 0) >= (m?.meta_horas || 60)
                    return (
                      <tr key={m?.id || Math.random().toString()}>
                        <td className="px-4 py-2.5 font-medium text-slate-900">{m?.nombre || 'Mentor'}</td>
                        <td className="px-4 py-2.5 text-slate-600">{m?.especialidad || 'Matemáticas'}</td>
                        <td className="px-4 py-2.5 font-mono font-bold text-slate-900">{(m?.horas_acumuladas || 0).toFixed(1)} h</td>
                        <td className="px-4 py-2.5 font-mono text-slate-500">{(m?.meta_horas || 60).toFixed(0)} h</td>
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
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
