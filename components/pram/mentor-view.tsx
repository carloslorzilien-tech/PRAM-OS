'use client'

import React, { useState } from 'react'
import {
  CalendarPlus,
  FileCheck2,
  TabletSmartphone,
  UserCheck,
  Award,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Clock,
  BookOpen,
} from 'lucide-react'
import { usePram } from '@/lib/pram-context'
import { Sesion, Estudiante } from '@/types/pram'
import { NomadPinModal } from './nomad-pin-modal'
import { PhygitalModal } from './phygital-modal'
import { NewSessionModal } from './new-session-modal'
import { cn } from '@/lib/utils'

export function MentorView() {
  const {
    currentUser,
    mentores,
    activeMentorId,
    sesionesVisibles,
    estudiantesVisibles,
    confirmarSesionPorMentor,
    getEstudianteById,
    getMentorById,
    requireAuth,
  } = usePram()

  const [selectedSesionForPin, setSelectedSesionForPin] = useState<Sesion | null>(null)
  const [isNomadModalOpen, setIsNomadModalOpen] = useState(false)
  const [isPhygitalModalOpen, setIsPhygitalModalOpen] = useState(false)
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false)
  const [targetEstudiantePhygital, setTargetEstudiantePhygital] = useState<string | undefined>(undefined)

  const activeMentor =
    currentUser.mentorData ||
    getMentorById(activeMentorId) ||
    mentores[0]

  const metaHorasInstitucional = 60
  const horasAcumuladas = activeMentor.horas_acumuladas || 48.5
  const porcentajeHoras = Math.min(
    100,
    Math.round((horasAcumuladas / metaHorasInstitucional) * 100)
  )

  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (porcentajeHoras / 100) * circumference

  const handleOpenPinTerminal = (sesion: Sesion) => {
    requireAuth('validar asistencia con PIN nómada', () => {
      setSelectedSesionForPin(sesion)
      setIsNomadModalOpen(true)
    })
  }

  const handleOpenPhygital = (estudianteId?: string) => {
    requireAuth('calificar examen diagnóstico', () => {
      setTargetEstudiantePhygital(estudianteId)
      setIsPhygitalModalOpen(true)
    })
  }

  const handleOpenNewSession = () => {
    requireAuth('agendar sesión pedagógica', () => {
      setIsNewSessionModalOpen(true)
    })
  }

  const handleConfirmarMentor = (sesionId: string) => {
    requireAuth('firmar sesión como mentor', () => {
      confirmarSesionPorMentor(sesionId)
    })
  }

  const getNivelBadgeInfo = (nivel: number) => {
    if (nivel <= 1) return { title: 'Inicial', rank: 'Novato', color: 'text-slate-700 bg-slate-100 border-slate-200' }
    if (nivel === 2) return { title: 'Básico', rank: 'Aspirante', color: 'text-slate-700 bg-slate-100 border-slate-200' }
    if (nivel === 3) return { title: 'Intermedio', rank: 'Avanzado', color: 'text-slate-700 bg-slate-100 border-slate-200' }
    if (nivel === 4) return { title: 'Sólido', rank: 'Avanzado', color: 'text-slate-700 bg-slate-100 border-slate-200' }
    return { title: 'Avanzado', rank: 'Dominio Completo', color: 'text-slate-700 bg-slate-100 border-slate-200' }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 pb-8 px-1">
      {/* 1. Tarjeta de Bienvenida y Rol */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col items-center text-center">
          <div className="mb-2.5 flex size-12 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-lg">
            {activeMentor.nombre.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>

          <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900">
            Hola, {activeMentor.nombre}
          </h2>

          <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-0.5 text-xs font-medium uppercase tracking-wider text-slate-700">
            <Sparkles className="size-3 text-slate-600" />
            <span>Rango: {activeMentor.rango} Mentor</span>
          </div>

          <p className="mt-1.5 text-xs text-slate-500 font-normal max-w-md">
            {activeMentor.especialidad || 'Matemáticas y Razonamiento Lógico'} · Liceo Minerva Mirabal
          </p>

          <button
            type="button"
            onClick={handleOpenNewSession}
            className="mt-5 inline-flex w-full h-10 items-center justify-center gap-2 rounded-md bg-slate-900 px-5 text-xs font-medium text-white transition-colors hover:bg-slate-800 cursor-pointer"
          >
            <CalendarPlus className="size-4" />
            <span>Agendar Sesión de Hoy</span>
          </button>
        </div>
      </section>

      {/* 2. Tarjeta de Progreso */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col items-center text-center">
          <div className="relative flex size-32 items-center justify-center">
            <svg className="size-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-slate-100"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-slate-900 transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-900">
                {porcentajeHoras}%
              </span>
              <span className="text-[9px] font-medium uppercase tracking-wider text-slate-500">
                Completo
              </span>
            </div>
          </div>

          <h3 className="mt-3 text-base font-semibold tracking-tight text-slate-900">
            Progreso de Servicio Social Institucional
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 font-normal max-w-sm">
            Requisito de 60 Horas Institucionales Validadas
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3.5 py-1.5">
            <Award className="size-4 text-slate-700" />
            <span className="text-xs font-medium text-slate-800">
              {horasAcumuladas.toFixed(1)} / {metaHorasInstitucional} Horas
            </span>
            <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.2 text-[10px] font-medium">
              ({porcentajeHoras}%)
            </span>
          </div>
        </div>
      </section>

      {/* 3. Cohorte Asignada */}
      <section className="space-y-3">
        <div className="text-center">
          <h3 className="text-xs font-semibold tracking-wider text-slate-700 uppercase">
            Cohorte Asignada
          </h3>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            {estudiantesVisibles.length} Estudiante(s) bajo tu supervisión directa
          </p>
        </div>

        <div className="space-y-2.5">
          {estudiantesVisibles.map((est) => {
            const badge = getNivelBadgeInfo(est.nivel_actual)
            const nivelNum = Math.round(est.nivel_actual)

            return (
              <div
                key={est.id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs"
              >
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2.5">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">
                      {est.nombre}
                    </h4>
                    <p className="text-xs font-normal text-slate-500 mt-0.5">
                      Grado {est.grado} · {est.liceo_seccion || 'Liceo Minerva Mirabal'}
                    </p>
                  </div>
                  <span className={cn('rounded-full border px-2 py-0.2 text-[10px] font-medium uppercase shrink-0', badge.color)}>
                    {badge.rank}
                  </span>
                </div>

                <div className="my-3 flex items-center justify-between gap-3 rounded-md bg-slate-50 p-2.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold font-mono text-slate-900">
                      {est.nivel_actual.toFixed(1)}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      / 5.0 · Nivel <strong className="text-slate-800 font-semibold">{badge.title}</strong>
                    </span>
                  </div>

                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div
                        key={lvl}
                        className={cn(
                          'h-4 w-2 rounded-xs transition-colors',
                          lvl <= nivelNum ? 'bg-slate-800' : 'bg-slate-200'
                        )}
                        title={`Nivel ${lvl}`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenPhygital(est.id)}
                  className="w-full inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
                >
                  <FileCheck2 className="size-3.5" />
                  <span>Calificar Examen Phygital</span>
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* 4. Sesiones y Validación Dual */}
      {sesionesVisibles.length > 0 && (
        <section className="space-y-3 pt-1">
          <div className="text-center">
            <h3 className="text-xs font-semibold tracking-wider text-slate-700 uppercase">
              Validación de Sesiones
            </h3>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Doble confirmación para acreditación de horas Institucional
            </p>
          </div>

          <div className="space-y-2">
            {sesionesVisibles.map((sesion) => {
              const estudiante = getEstudianteById(sesion.estudiante_id)
              const ambosConfirmados =
                sesion.confirmacion_mentor && sesion.confirmacion_estudiante

              return (
                <div
                  key={sesion.id}
                  className={cn(
                    'rounded-lg border p-3.5 transition-colors shadow-xs',
                    ambosConfirmados
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : 'border-slate-200 bg-white'
                  )}
                >
                  <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                        {sesion.tema}
                      </h4>
                      <p className="text-xs text-slate-500 font-normal mt-0.5">
                        {estudiante?.nombre} · {sesion.fecha_programada} ({sesion.duracion_minutos} min)
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleConfirmarMentor(sesion.id)}
                        disabled={sesion.confirmacion_mentor}
                        className={cn(
                          'inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors cursor-pointer',
                          sesion.confirmacion_mentor
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        )}
                      >
                        <UserCheck className="size-3.5" />
                        <span>{sesion.confirmacion_mentor ? 'Mentor OK' : 'Firmar Mentor'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenPinTerminal(sesion)}
                        disabled={sesion.confirmacion_estudiante}
                        className={cn(
                          'inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors cursor-pointer',
                          sesion.confirmacion_estudiante
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default'
                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        )}
                      >
                        <TabletSmartphone className="size-3.5" />
                        <span>{sesion.confirmacion_estudiante ? 'PIN Validado' : 'PIN Alumno'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Modales */}
      <NomadPinModal
        isOpen={isNomadModalOpen}
        onClose={() => setIsNomadModalOpen(false)}
        sesion={selectedSesionForPin}
      />
      <PhygitalModal
        isOpen={isPhygitalModalOpen}
        onClose={() => setIsPhygitalModalOpen(false)}
        defaultEstudianteId={targetEstudiantePhygital}
      />
      <NewSessionModal
        isOpen={isNewSessionModalOpen}
        onClose={() => setIsNewSessionModalOpen(false)}
      />
    </div>
  )
}
