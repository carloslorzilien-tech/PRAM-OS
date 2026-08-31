'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Loader2,
  Award,
  FileCheck,
  UserCheck,
  ExternalLink,
  UserCog,
  GraduationCap,
  TrendingUp,
} from 'lucide-react'
import { DirectorAuditTable } from '@/components/pram/director-table'
import { DirectorRequestsTable } from '@/components/pram/director-requests-table'
import { DirectorUsersTable } from '@/components/pram/director-users-table'
import { DirectorStudentsOverview } from '@/components/pram/director-students-overview'
import { useFirebaseAuth } from '@/lib/firebase-auth'
import { UserProfileBadge } from '@/components/pram/user-profile-card'
import {
  getFirebasePendingSessions,
  getFirebasePendingUsers,
  createFlexibleCuvForMentor,
  subscribeToRealtimeKPIs,
} from '@/lib/firebase-service'
import { Sesion, Usuario, Mentor } from '@/lib/db'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function DirectorDashboardPage() {
  const { user, userProfile, loading: authLoading } = useFirebaseAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<'audit' | 'users' | 'allUsers' | 'students'>('audit')
  const [pendingSessions, setPendingSessions] = useState<Sesion[]>([])
  const [pendingUsers, setPendingUsers] = useState<Usuario[]>([])
  const [kpis, setKpis] = useState({ horasCertificadas: 0, estudiantesAtendidos: 0, sesionesValidadas: 0, tasaAsistencia: 100 })
  const [topMentores, setTopMentores] = useState<Mentor[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [generatingCuvId, setGeneratingCuvId] = useState<string | null>(null)
  const [cuvNotification, setCuvNotification] = useState<string | null>(null)

  // 1. Redirecciones y Seguridad
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/')
      } else if (userProfile?.status === 'PENDING') {
        router.push('/solicitud-pendiente')
      }
    }
  }, [user, userProfile, authLoading, router])

  // 2. Carga y Suscripción en Tiempo Real desde Firestore (KPIs y Mentores para CUV)
  useEffect(() => {
    if (!user || (userProfile?.rol !== 'DIRECTOR' && userProfile?.rol !== 'AREA_DIRECTOR')) {
      if (!authLoading) setIsLoadingData(false)
      return
    }

    // A) Suscripción en vivo a KPIs agregados
    const unsubKPIs = subscribeToRealtimeKPIs((liveKpis) => {
      setKpis(liveKpis)
    })

    // B) Suscripción en vivo al directorio de Mentores en Firestore
    const usersRef = collection(db, 'users')
    const unsubMentores = onSnapshot(
      usersRef,
      (snapshot) => {
        const rawMentores: Mentor[] = []
        snapshot.forEach((docSnap) => {
          const u = docSnap.data()
          const r = (u.rol || u.role || '').toUpperCase()
          const s = (u.status || '').toUpperCase()
          const horas = Number(u.horasAcumuladas ?? u.horas_acumuladas ?? 0)

          if (
            s !== 'INACTIVE' &&
            s !== 'REJECTED' &&
            (r.includes('MENTOR') || r.includes('TUTOR') || r.includes('DIRECTOR') || horas > 0)
          ) {
            const name = u.nombre || u.name || (u.email ? u.email.split('@')[0] : 'Tutor PRAM')
            const area = u.area || u.especialidad || 'Refuerzo Académico'
            const meta = Number(u.metaHoras ?? u.meta_horas ?? 60)
            let rango = 'Tutor en Certificación'
            if (horas >= 60) rango = 'Líder de Área'
            else if (horas >= 30) rango = 'Mentor Sénior'
            else if (horas >= 10) rango = 'Tutor Titular'

            rawMentores.push({
              id: docSnap.id,
              nombre: name,
              email: u.email || '',
              rango,
              horas_acumuladas: Number.isFinite(horas) ? horas : 0,
              meta_horas: Number.isFinite(meta) && meta > 0 ? meta : 60,
              especialidad: area,
            })
          }
        })

        rawMentores.sort((a, b) => b.horas_acumuladas - a.horas_acumuladas)
        setTopMentores(rawMentores)
      },
      (err) => {
        console.warn('[Director Dashboard Users onSnapshot warn]:', err)
      }
    )

    // C) Carga inicial de solicitudes y sesiones pendientes de auditoría
    async function loadPending() {
      try {
        const [sessionsData, usersData] = await Promise.all([
          getFirebasePendingSessions(),
          getFirebasePendingUsers(),
        ])
        setPendingSessions(sessionsData)
        setPendingUsers(usersData)
      } catch (error) {
        console.error('[Director Dashboard Pending Fetch Error]:', error)
        setIsOfflineMode(true)
      } finally {
        setIsLoadingData(false)
      }
    }

    loadPending()

    return () => {
      unsubKPIs()
      unsubMentores()
    }
  }, [user, userProfile, authLoading])

  // Emisión Flexible de CUV (Desacoplada de la restricción >= 60h)
  const handleGenerateFlexibleCuv = async (mentor: Mentor) => {
    setGeneratingCuvId(mentor.id)
    setCuvNotification(null)
    const code = await createFlexibleCuvForMentor(
      mentor.nombre,
      mentor.id,
      mentor.horas_acumuladas,
      mentor.especialidad
    )
    setGeneratingCuvId(null)

    if (code) {
      setCuvNotification(`CUV emitido exitosamente: ${code}`)
      window.open(`/verify/${encodeURIComponent(code)}`, '_blank')
    } else {
      setCuvNotification('Error al emitir el certificado CUV en Firestore.')
    }
  }

  if (authLoading || (isLoadingData && (userProfile?.rol === 'DIRECTOR' || userProfile?.rol === 'AREA_DIRECTOR'))) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="size-8 animate-spin text-slate-400 mb-4" />
        <p className="text-sm font-medium text-slate-500">Cargando Panel de Dirección...</p>
      </div>
    )
  }

  if (!user || userProfile?.status === 'PENDING') {
    return null
  }

  const isDirector = userProfile?.rol === 'DIRECTOR' || userProfile?.rol === 'AREA_DIRECTOR'

  if (!isDirector) {
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
              Tu cuenta ({user.email}) está registrada con el rol de <strong>Tutor / Mentor</strong>.
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

  const directorName = userProfile?.nombre || 'Director'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {isOfflineMode && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-xs px-4 py-2 flex items-center justify-center gap-2 font-medium">
          <AlertTriangle className="size-4 text-amber-600 shrink-0" />
          <span>Modo desconectado o error de lectura. Algunas funciones pueden estar limitadas.</span>
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
          <UserProfileBadge />
        </div>
      </header>

      {/* Cabecera Imprimible */}
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
        {/* Notificación de Emisión CUV */}
        {cuvNotification && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
            <span>{cuvNotification}</span>
            <button
              type="button"
              onClick={() => setCuvNotification(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

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
              Usuarios Pendientes
            </span>
            <p className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              {pendingUsers.length}
            </p>
            <p className="text-[11px] font-medium text-indigo-700 mt-1">
              Asignación de rol
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
        </section>

        {/* 2. Pestañas de Gestión */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <FileCheck className="size-4" />
              <span>Auditoría de Sesiones ({pendingSessions.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <UserCheck className="size-4" />
              <span>Solicitudes Pendientes ({pendingUsers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('allUsers')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'allUsers'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <UserCog className="size-4" />
              <span>Gestión de Usuarios</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('students')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <TrendingUp className="size-4" />
              <span>Consistencia & Progreso Académico</span>
            </button>
          </div>

          {activeTab === 'audit' && (
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <DirectorAuditTable initialSessions={pendingSessions} />
            </div>
          )}

          {activeTab === 'users' && (
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Aprobación de Solicitudes (users/{'{uid}'})
                </h3>
                <p className="text-xs text-slate-500 font-normal">
                  Asigna el rol correspondiente y aprueba el acceso en Firestore.
                </p>
              </div>
              <DirectorRequestsTable initialUsers={pendingUsers} />
            </div>
          )}

          {activeTab === 'allUsers' && (
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Gestión Completa de Usuarios · Tiempo Real
                </h3>
                <p className="text-xs text-slate-500 font-normal">
                  Modifica roles, activa o desactiva cuentas. Los cambios se sincronizan instantáneamente en Firestore.
                </p>
              </div>
              <DirectorUsersTable />
            </div>
          )}

          {activeTab === 'students' && (
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Consistencia y Progreso Académico de Estudiantes
                </h3>
                <p className="text-xs text-slate-500 font-normal">
                  Supervisión institucional del avance individual, evolución diagnóstica ($\Delta$) e historial inmutable de evaluaciones.
                </p>
              </div>
              <DirectorStudentsOverview />
            </div>
          )}
        </section>


        {/* 3. Expediente de Mentores & Emisión Flexible de CUV (Desacoplado de 60h) */}
        <section className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold tracking-tight text-slate-900">
                Directorio Oficial de Mentores & Emisión Flexible de CUV
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                Genera el certificado CUV en cualquier momento con las horas acumuladas exactas del tutor.
              </p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
              Distrito 10-04
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Mentor / Tutor</th>
                  <th className="px-4 py-3">Especialidad</th>
                  <th className="px-4 py-3">Horas Acumuladas</th>
                  <th className="px-4 py-3">Meta (60h)</th>
                  <th className="px-4 py-3 text-right">Emisión de Certificado CUV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {topMentores.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-500">
                      <p className="font-semibold text-slate-800">No hay tutores activos registrados aún en Firestore.</p>
                      <p className="text-slate-400 mt-0.5">Los docentes aprobados con horas pedagógicas aparecerán aquí automáticamente.</p>
                    </td>
                  </tr>
                ) : (
                  topMentores.map((m) => {
                    const isProcessingCuv = generatingCuvId === m.id
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-900">{m.nombre}</td>
                        <td className="px-4 py-3 text-slate-600">{m.especialidad}</td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">{m.horas_acumuladas.toFixed(1)} h</td>
                        <td className="px-4 py-3 font-mono text-slate-500">{m.meta_horas.toFixed(0)} h</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            disabled={isProcessingCuv}
                            onClick={() => handleGenerateFlexibleCuv(m)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 px-3 py-1.5 text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                          >
                            {isProcessingCuv ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Award className="size-3.5 text-amber-400" />
                            )}
                            <span>{isProcessingCuv ? 'Generando...' : `Emitir / Ver CUV (${m.horas_acumuladas.toFixed(1)}h)`}</span>
                            <ExternalLink className="size-3 text-slate-400" />
                          </button>
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
