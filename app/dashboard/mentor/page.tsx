'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Clock,
  GraduationCap,
  BookOpen,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { useFirebaseAuth } from '@/lib/firebase-auth'
import { UserProfileBadge } from '@/components/pram/user-profile-card'
import { MentorSessionTab } from '@/components/pram/mentor-session-tab'
import { MentorStudentsTab } from '@/components/pram/mentor-students-tab'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function MentorDashboardPage() {
  const { user, userProfile, loading: authLoading } = useFirebaseAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<'sessions' | 'students'>('sessions')
  const [horasAcumuladas, setHorasAcumuladas] = useState<number>(0)
  const [metaHoras] = useState<number>(60)
  const [loadingHoras, setLoadingHoras] = useState(true)

  // Auth guard
  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push('/')
      else if (userProfile?.status === 'PENDING') router.push('/solicitud-pendiente')
    }
  }, [user, userProfile, authLoading, router])

  // Live-sync horasAcumuladas from Firestore users/{uid}
  useEffect(() => {
    if (!user?.uid) return
    const userRef = doc(db, 'users', user.uid)
    const unsub = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        const horas = data.horasAcumuladas ?? data.horas_acumuladas ?? 0
        setHorasAcumuladas(Number(horas))
      }
      setLoadingHoras(false)
    }, () => setLoadingHoras(false))
    return () => unsub()
  }, [user?.uid])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="size-7 animate-spin" />
          <p className="text-xs font-medium">Cargando panel del tutor...</p>
        </div>
      </div>
    )
  }

  if (!user || userProfile?.status === 'PENDING') return null

  const mentorName = user.displayName || userProfile?.nombre || 'Tutor PRAM'
  const porcentaje = Math.min(100, Math.round((horasAcumuladas / metaHoras) * 100))
  const horasFaltantes = Math.max(0, metaHoras - horasAcumuladas)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-3 sm:px-8 gap-2 backdrop-blur-md">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <Link
            href="/"
            className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shrink-0"
            title="Volver al Portal"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 block truncate">
              PRAM OS · Panel del Tutor
            </span>
            <h1 className="text-xs sm:text-sm font-semibold tracking-tight text-slate-900 leading-tight truncate">
              {mentorName}
            </h1>
          </div>
        </div>
        <div className="shrink-0 flex items-center">
          <UserProfileBadge />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">

        {/* KPI: Progreso de Horas — siempre visible */}
        <section className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Acreditación Servicio Social
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                {loadingHoras ? (
                  <Loader2 className="size-6 animate-spin text-slate-400 mt-1" />
                ) : (
                  <>
                    <span className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
                      {horasAcumuladas.toFixed(1)}
                    </span>
                    <span className="text-sm text-slate-500 font-normal">
                      / {metaHoras} horas requeridas ({porcentaje}%)
                    </span>
                  </>
                )}
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
              <Clock className="size-3.5 text-slate-500" />
              <span>Faltan {horasFaltantes.toFixed(1)} horas</span>
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
              <div
                className="h-full bg-slate-800 rounded-full transition-all duration-700"
                style={{ width: `${porcentaje}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-normal">
              <span>0 h</span>
              <span>30 h (Intermedio)</span>
              <span>60 h (Certificación CUV)</span>
            </div>
          </div>
        </section>

        {/* Two-Tab Interface */}
        <section className="space-y-4">
          {/* Tab Switcher */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('sessions')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'sessions'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <BookOpen className="size-4" />
              <span>Registro de Sesiones</span>
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
              <GraduationCap className="size-4" />
              <span>Gestión de Alumnos</span>
            </button>
          </div>

          {/* Tab A: Registro de Sesiones */}
          {activeTab === 'sessions' && (
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-semibold tracking-tight text-slate-900">
                  Registro de Sesión Pedagógica
                </h2>
                <p className="text-xs text-slate-500 font-normal">
                  Registra tus horas, asistencia y tema. Las horas se acumulan automáticamente en tu perfil.
                </p>
              </div>
              <MentorSessionTab />
            </div>
          )}

          {/* Tab B: Gestión de Alumnos */}
          {activeTab === 'students' && (
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-semibold tracking-tight text-slate-900">
                  Gestión de Alumnos y Seguimiento Académico
                </h2>
                <p className="text-xs text-slate-500 font-normal">
                  Registra alumnos, diagnósticos iniciales y actualiza sus notas de seguimiento.
                </p>
              </div>
              <MentorStudentsTab />
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

