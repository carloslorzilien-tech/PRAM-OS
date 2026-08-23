import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Clock,
  CheckCircle2,
  Calendar,
  ArrowLeft,
  Users,
} from 'lucide-react'
import { getMentorSessions, getTopMentores } from '@/lib/db'
import { MentorSessionForm } from '@/components/pram/mentor-form'
import { getOrCreateCurrentUser } from '@/lib/auth-user'
import { UserProfileBadge } from '@/components/pram/user-profile-card'

export const dynamic = 'force-dynamic'

export default async function MentorDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ mentor?: string }>
}) {
  const params = await searchParams

  // 1. Autenticación y Redirección Inteligente por Rol y Estado
  let currentUser = null
  try {
    currentUser = await getOrCreateCurrentUser()
  } catch (err) {
    console.error('[PRAM Auth Error in MentorDashboardPage]:', err)
  }

  if (currentUser) {
    if (currentUser.status === 'PENDING') {
      redirect('/solicitud-pendiente')
    }
    // Redirección inteligente de rol: Si es DIRECTOR intentando entrar a mentor, redirigir a director
    if (currentUser.rol === 'DIRECTOR' || currentUser.rol === 'AREA_DIRECTOR') {
      redirect('/dashboard/director')
    }
  }

  // 2. Consulta blindada a Neon DB (Cero errores sintácticos o de null)
  let mentorId = params.mentor || 'm-1'
  let dbMentor = null
  let sesiones: any[] = []

  try {
    if (currentUser?.email && !params.mentor) {
      const allMentores = await getTopMentores(50)
      const found = allMentores.find(
        (m) => m.email.toLowerCase() === currentUser.email.toLowerCase()
      )
      if (found) mentorId = found.id
    }

    const sessionData = await getMentorSessions(mentorId)
    dbMentor = sessionData.mentor
    sesiones = sessionData.sesiones || []
  } catch (error) {
    console.error('[PRAM DB Error in MentorDashboardPage]:', error)
  }

  const currentMentor = dbMentor || {
    id: mentorId,
    nombre: currentUser?.nombre || 'Prof. Carlos Omar Lorzilien',
    email: currentUser?.email || 'carlosomarlorzilienservilien@gmail.com',
    rango: 'Head' as const,
    horas_acumuladas: 0,
    meta_horas: 60.0,
    especialidad: 'Matemáticas' as const,
  }

  const porcentaje = Math.min(
    100,
    Math.round((currentMentor.horas_acumuladas / currentMentor.meta_horas) * 100)
  )
  const horasFaltantes = Math.max(0, currentMentor.meta_horas - currentMentor.horas_acumuladas)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Header */}
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
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                PRAM OS · Panel del Tutor
              </span>
              <span className="rounded-md bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.2 text-[10px] font-medium">
                {currentMentor.rango}
              </span>
            </div>
            <h1 className="text-sm font-semibold tracking-tight text-slate-900 leading-tight">
              {currentMentor.nombre}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <UserProfileBadge
            userRole={currentUser?.rol}
            userStatus={currentUser?.status}
            userArea={currentUser?.area}
          />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        {/* 1. Header con Progreso hacia 60 Horas del Servicio Social */}
        <section className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Acreditación Servicio Social
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
                  {currentMentor.horas_acumuladas.toFixed(1)}
                </span>
                <span className="text-sm text-slate-500 font-normal">
                  / {currentMentor.meta_horas.toFixed(0)} horas requeridas ({porcentaje}%)
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
                <Clock className="size-3.5 text-slate-500" />
                <span>Faltan {horasFaltantes.toFixed(1)} horas</span>
              </span>
            </div>
          </div>

          {/* Barra de Progreso Limpia */}
          <div className="space-y-1.5">
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
              <div
                className="h-full bg-slate-800 rounded-full transition-all duration-500"
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

        {/* 2. Formulario de Registro Rápido (< 30 segundos) */}
        <section className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-semibold tracking-tight text-slate-900">
              Registro Rápido de Sesión Pedagógica
            </h2>
            <p className="text-xs text-slate-500 font-normal">
              Completa el formulario en menos de 30 segundos para enviar tus horas a auditoría.
            </p>
          </div>

          <MentorSessionForm mentorId={currentMentor.id} />
        </section>

        {/* 3. Historial de Sesiones con Badges de Estado */}
        <section className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-slate-900">
                Historial de Sesiones Impartidas
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                Estado de validación ministerial de tus tutorías
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500">
              {sesiones.length} sesiones
            </span>
          </div>

          {sesiones.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No tienes sesiones registradas aún. Registra tu primera sesión arriba.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sesiones.map((sesion) => {
                const isApproved = sesion.estado === 'approved'
                const isPending = sesion.estado === 'pending'

                return (
                  <div
                    key={sesion.id}
                    className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                          {sesion.tema}
                        </h3>
                        <span className="rounded-md bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.2 text-[10px] font-medium">
                          {sesion.materia}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-normal">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3 text-slate-400" />
                          {sesion.fecha_sesion}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3 text-slate-400" />
                          {sesion.duracion_minutos} min ({(sesion.duracion_minutos / 60).toFixed(2)} h)
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Users className="size-3 text-slate-400" />
                          {sesion.cantidad_alumnos} alumno(s)
                        </span>
                      </div>
                      {sesion.notas && (
                        <p className="text-[11px] text-slate-500 italic">
                          "{sesion.notas}"
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      {isApproved ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 text-xs font-medium">
                          <CheckCircle2 className="size-3 text-emerald-600" />
                          <span>Aprobado / Inmutable</span>
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 text-xs font-medium">
                          <Clock className="size-3 text-amber-600" />
                          <span>Pendiente de Auditoría</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 text-xs font-medium">
                          <span>Rechazado</span>
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
