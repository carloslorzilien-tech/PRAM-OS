'use client'

import React, { useEffect, useState } from 'react'
import { Clock, Users, CheckCircle2, TrendingUp, Sparkles, Target, Layers } from 'lucide-react'
import { subscribeToRealtimeKPIs } from '@/lib/firebase-service'

export interface AnimatedKPIsProps {
  horasCertificadas?: number
  estudiantesAtendidos?: number
  sesionesValidadas?: number
  tasaAsistencia?: number
}

export function getCollectiveCohortTarget(studentCount: number): { target: number; phaseLabel: string } {
  if (studentCount > 50) return { target: 100, phaseLabel: 'Fase 4: Expansión Distrital' }
  if (studentCount > 25) return { target: 50, phaseLabel: 'Fase 3: Cobertura Ampliada' }
  if (studentCount > 12) return { target: 25, phaseLabel: 'Fase 2: Consolidación Liceo' }
  return { target: 12, phaseLabel: 'Fase 1: Cohorte Inicial' }
}

function useCountUp(target: number, duration = 1000, decimals = 0) {
  const [count, setCount] = useState(target)

  useEffect(() => {
    if (!Number.isFinite(target) || target <= 0) {
      setCount(0)
      return
    }
    let startTimestamp: number | null = null
    const startValue = 0

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const current = startValue + easeOut * (target - startValue)

      setCount(Number(current.toFixed(decimals)))

      if (progress < 1) {
        window.requestAnimationFrame(step)
      } else {
        setCount(target)
      }
    }

    window.requestAnimationFrame(step)
  }, [target, duration, decimals])

  return Number.isFinite(count) ? count : 0
}

export function AnimatedKPIs({
  horasCertificadas: initialHoras = 0,
  estudiantesAtendidos: initialAlumnos = 0,
  sesionesValidadas: initialSesiones = 0,
  tasaAsistencia: initialAsistencia = 100,
}: AnimatedKPIsProps) {
  const [kpis, setKpis] = useState({
    horasCertificadas: Number.isFinite(initialHoras) ? initialHoras : 0,
    estudiantesAtendidos: Number.isFinite(initialAlumnos) ? initialAlumnos : 0,
    sesionesValidadas: Number.isFinite(initialSesiones) ? initialSesiones : 0,
    tasaAsistencia: Number.isFinite(initialAsistencia) && initialAsistencia > 0 ? initialAsistencia : 100,
  })

  // Sincronización reactiva en tiempo real con Firestore
  useEffect(() => {
    try {
      const unsub = subscribeToRealtimeKPIs((live) => {
        setKpis({
          horasCertificadas: Number.isFinite(live.horasCertificadas) ? live.horasCertificadas : 0,
          estudiantesAtendidos: Number.isFinite(live.estudiantesAtendidos) ? live.estudiantesAtendidos : 0,
          sesionesValidadas: Number.isFinite(live.sesionesValidadas) ? live.sesionesValidadas : 0,
          tasaAsistencia: Number.isFinite(live.tasaAsistencia) && live.tasaAsistencia > 0 ? live.tasaAsistencia : 100,
        })
      })
      return () => unsub()
    } catch (err) {
      console.warn('[AnimatedKPIs] Suscripción offline:', err)
    }
  }, [])

  const horasCount = useCountUp(kpis.horasCertificadas, 1000, 1)
  const alumnosCount = useCountUp(kpis.estudiantesAtendidos, 1000, 0)
  const sesionesCount = useCountUp(kpis.sesionesValidadas, 1000, 0)
  const asistenciaCount = useCountUp(kpis.tasaAsistencia, 1000, 0)

  const isZeroAlumnos = kpis.estudiantesAtendidos === 0
  const isZeroSesiones = kpis.sesionesValidadas === 0
  const isZeroHoras = kpis.horasCertificadas === 0

  // Cálculo de meta colectiva escalable (12 -> 25 -> 50 -> 100)
  const { target: cohortTarget, phaseLabel: cohortPhaseLabel } = getCollectiveCohortTarget(kpis.estudiantesAtendidos)
  const cohortPct = Math.min(100, Math.round((kpis.estudiantesAtendidos / cohortTarget) * 100))

  return (
    <div className="space-y-4">
      {/* Grid de 4 KPIs Macro */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Total Horas Pedagógicas Donadas */}
        <div className="p-5 sm:p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Horas Donadas
            </span>
            <div className="flex size-7 items-center justify-center rounded-md bg-slate-100 text-slate-700">
              <Clock className="size-3.5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 font-mono">
              {isZeroHoras ? '0.0 h' : `${horasCount.toFixed(1)} h`}
            </p>
            <p className="text-xs text-slate-500 font-normal mt-1.5 leading-relaxed">
              {isZeroHoras ? (
                <span>0.0 h acumuladas — Primeras tutorías por registrar</span>
              ) : (
                <span>Horas Validadas por la Dirección (Distrito 10-04)</span>
              )}
            </p>
          </div>
        </div>

        {/* KPI 2: Estudiantes en Refuerzo Activo */}
        <div className="p-5 sm:p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Refuerzo Activo
            </span>
            <div className="flex size-7 items-center justify-center rounded-md bg-slate-100 text-slate-700">
              <Users className="size-3.5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 font-mono">
              {alumnosCount} <span className="text-xl sm:text-2xl font-normal text-slate-400 font-sans">/ {cohortTarget}</span>
            </p>
            <p className="text-xs text-slate-500 font-normal mt-1.5 leading-relaxed">
              {isZeroAlumnos ? (
                <span className="text-indigo-700 font-medium inline-flex items-center gap-1">
                  <Sparkles className="size-3 shrink-0" /> Registra tu primer estudiante para iniciar el indicador
                </span>
              ) : (
                <span>Meta Colectiva: {cohortTarget} Estudiantes</span>
              )}
            </p>
          </div>
        </div>

        {/* KPI 3: Sesiones Impartidas */}
        <div className="p-5 sm:p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sesiones Impartidas
            </span>
            <div className="flex size-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="size-3.5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 font-mono">
              {isZeroSesiones ? '0' : sesionesCount}
            </p>
            <p className="text-xs font-normal mt-1.5 leading-relaxed">
              {isZeroSesiones ? (
                <span className="text-slate-500">0 Sesiones — Se computará con la primera tutoría aprobada</span>
              ) : (
                <span className="text-emerald-700 font-medium">Aprobadas en Auditoría MINERD</span>
              )}
            </p>
          </div>
        </div>

        {/* KPI 4: Tasa de Asistencia / Compromiso */}
        <div className="p-5 sm:p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Compromiso Asistencia
            </span>
            <div className="flex size-7 items-center justify-center rounded-md bg-slate-100 text-slate-700">
              <TrendingUp className="size-3.5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 font-mono">
              {`${asistenciaCount.toFixed(0)}%`}
            </p>
            <p className="text-xs text-slate-500 font-normal mt-1.5 leading-relaxed">
              Línea base institucional
            </p>
          </div>
        </div>
      </section>

      {/* Barra de Progreso Colectiva de la Cohorte */}
      <section className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
              Avance Colectivo de la Cohorte PRAM
            </h3>
            <span className="inline-flex items-center rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold px-2.5 py-0.5">
              {cohortPhaseLabel}
            </span>
          </div>
          <div className="text-left sm:text-right">
            <span className="font-mono text-xs font-bold text-slate-900">
              {kpis.estudiantesAtendidos} / {cohortTarget} Estudiantes en Refuerzo Activo
            </span>
            <span className="text-[11px] text-slate-500 ml-2 font-semibold font-mono">
              ({cohortPct}%)
            </span>
          </div>
        </div>

        {/* Barra de Progreso Visual */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              cohortPct >= 100 ? 'bg-emerald-600' : 'bg-slate-900'
            }`}
            style={{ width: `${Math.max(cohortPct > 0 ? cohortPct : (isZeroAlumnos ? 2 : cohortPct), 2)}%` }}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-1 pt-1">
          <span>
            {isZeroAlumnos
              ? '0 / 12 Estudiantes — El progreso de la cohorte iniciará automáticamente con el registro del primer estudiante.'
              : `Meta escalable del Programa Minerva Mirabal: al completar ${cohortTarget} estudiantes, la meta escala a la siguiente fase.`}
          </span>
          <span className="font-medium text-slate-600 shrink-0">
            Liceo Minerva Mirabal · Distrito 10-04
          </span>
        </div>
      </section>
    </div>
  )
}


