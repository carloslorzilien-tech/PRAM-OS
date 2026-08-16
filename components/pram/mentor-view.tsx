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

  const metaHorasMinerd = 60
  const horasAcumuladas = activeMentor.horas_acumuladas || 48.5
  const porcentajeHoras = Math.min(
    100,
    Math.round((horasAcumuladas / metaHorasMinerd) * 100)
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
    if (nivel <= 1) return { title: 'Crítico', rank: 'Novato', color: 'text-red-700 bg-red-50 border-red-200' }
    if (nivel === 2) return { title: 'Básico', rank: 'Aspirante', color: 'text-red-700 bg-red-50 border-red-200' }
    if (nivel === 3) return { title: 'Funcional', rank: 'Avanzado', color: 'text-blue-700 bg-blue-50 border-blue-200' }
    if (nivel === 4) return { title: 'Sólido', rank: 'Avanzado', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
    return { title: 'Avanzado', rank: 'Élite', color: 'text-emerald-800 bg-emerald-50 border-emerald-300' }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 pb-8 px-1">
      {/* 1. Tarjeta de Bienvenida y Rol (Apilada) */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex size-16 items-center justify-center rounded-2xl bg-[#152642] text-white font-bold text-xl shadow-md">
            {activeMentor.nombre.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Hola, {activeMentor.nombre}
          </h2>

          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#152642]/20 bg-[#152642]/5 px-3.5 py-1 text-xs font-bold uppercase tracking-wide text-[#152642]">
            <Sparkles className="size-3.5 text-[#152642]" />
            <span>RANGO: {activeMentor.rango} MENTOR</span>
          </div>

          <p className="mt-2 text-xs text-slate-500 font-medium max-w-md">
            {activeMentor.especialidad || 'Matemáticas y Razonamiento Lógico'} · Liceo Minerva Mirabal
          </p>

          <button
            type="button"
            onClick={handleOpenNewSession}
            className="mt-6 inline-flex w-full h-12 items-center justify-center gap-2 rounded-2xl bg-[#152642] px-6 text-sm font-bold text-white shadow-md transition-all hover:bg-[#152642]/90 hover:shadow-lg active:scale-[0.98] cursor-pointer"
          >
            <CalendarPlus className="size-5" />
            <span>AGENDAR SESIÓN DE HOY</span>
          </button>
        </div>
      </section>

      {/* 2. Tarjeta de Progreso (Elemento Central con Progress Ring) */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="relative flex size-36 items-center justify-center">
            <svg className="size-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-slate-100"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-[#152642] transition-all duration-1000 ease-out"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black tracking-tight text-slate-900">
                {porcentajeHoras}%
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                COMPLETO
              </span>
            </div>
          </div>

          <h3 className="mt-4 text-lg font-black tracking-tight text-slate-900 sm:text-xl">
            Progreso de Servicio Social MINERD
          </h3>
          <p className="mt-1 text-xs text-slate-500 font-medium max-w-sm">
            Requisito de 60 Horas Institucionales Validadas
          </p>

          <div className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-50 border border-slate-200/80 px-4 py-2">
            <Award className="size-4 text-[#152642]" />
            <span className="text-sm font-bold text-slate-800">
              {horasAcumuladas.toFixed(1)} / {metaHorasMinerd} Horas
            </span>
            <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[11px] font-bold">
              ({porcentajeHoras}%)
            </span>
          </div>
        </div>
      </section>

      {/* 3. Cohorte Asignada (RBAC Filtered) */}
      <section className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-black tracking-tight text-slate-900 uppercase sm:text-xl">
            COHORTE ASIGNADA
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {estudiantesVisibles.length} Estudiante(s) bajo tu supervisión directa
          </p>
        </div>

        <div className="space-y-3">
          {estudiantesVisibles.map((est) => {
            const badge = getNivelBadgeInfo(est.nivel_actual)
            const nivelNum = Math.round(est.nivel_actual)

            return (
              <div
                key={est.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-base font-black text-slate-900">
                      {est.nombre}
                    </h4>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      Grado {est.grado} · {est.liceo_seccion || 'Liceo Minerva Mirabal'}
                    </p>
                  </div>
                  <span className={cn('rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase shrink-0', badge.color)}>
                    {badge.rank}
                  </span>
                </div>

                <div className="my-4 flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#152642]">
                      {est.nivel_actual.toFixed(1)}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      / 5.0 · Nivel <strong className="text-slate-800">{badge.title}</strong>
                    </span>
                  </div>

                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div
                        key={lvl}
                        className={cn(
                          'h-6 w-3 rounded-sm transition-all',
                          lvl <= nivelNum
                            ? lvl <= 2
                              ? 'bg-red-600'
                              : lvl === 3
                              ? 'bg-blue-600'
                              : 'bg-emerald-600'
                            : 'bg-slate-200'
                        )}
                        title={`Nivel ${lvl}`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenPhygital(est.id)}
                  className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#152642] shadow-2xs transition-all hover:bg-[#152642] hover:text-white hover:border-[#152642] active:scale-[0.99] cursor-pointer"
                >
                  <FileCheck2 className="size-4" />
                  <span>CALIFICAR EXAMEN</span>
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* 4. Sesiones y Validación Dual (RBAC Filtered) */}
      {sesionesVisibles.length > 0 && (
        <section className="space-y-3 pt-2">
          <div className="text-center">
            <h3 className="text-sm font-black uppercase tracking-wide text-slate-700">
              Validación de Sesiones
            </h3>
            <p className="text-xs text-slate-500">
              Doble confirmación para acreditación de horas MINERD
            </p>
          </div>

          <div className="space-y-2.5">
            {sesionesVisibles.map((sesion) => {
              const estudiante = getEstudianteById(sesion.estudiante_id)
              const ambosConfirmados =
                sesion.confirmacion_mentor && sesion.confirmacion_estudiante

              return (
                <div
                  key={sesion.id}
                  className={cn(
                    'rounded-2xl border p-4 transition-all shadow-2xs',
                    ambosConfirmados
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : 'border-slate-200 bg-white'
                  )}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {sesion.tema}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {estudiante?.nombre} · {sesion.fecha_programada} ({sesion.duracion_minutos} min)
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleConfirmarMentor(sesion.id)}
                        disabled={sesion.confirmacion_mentor}
                        className={cn(
                          'inline-flex h-8 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition-all cursor-pointer',
                          sesion.confirmacion_mentor
                            ? 'bg-emerald-100 text-emerald-800 cursor-default'
                            : 'bg-[#152642] text-white hover:bg-[#152642]/90'
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
                          'inline-flex h-8 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition-all cursor-pointer',
                          sesion.confirmacion_estudiante
                            ? 'bg-emerald-100 text-emerald-800 cursor-default'
                            : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
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
