'use client'

import React, { useEffect, useState } from 'react'
import { Clock, Users, CheckCircle2, TrendingUp, Sparkles, Building2 } from 'lucide-react'
import { subscribeToRealtimeKPIs } from '@/lib/firebase-service'

export interface AnimatedKPIsProps {
  horasCertificadas?: number
  estudiantesAtendidos?: number
  sesionesValidadas?: number
  tasaAsistencia?: number
}

export function getCollectiveCohortTarget(studentCount: number): { target: number; phaseLabel: string } {
  if (studentCount >= 50) return { target: 100, phaseLabel: 'FASE 4 · EXPANSIÓN DISTRITAL' }
  if (studentCount >= 25) return { target: 50, phaseLabel: 'FASE 3 · COBERTURA AMPLIADA' }
  if (studentCount >= 12) return { target: 25, phaseLabel: 'FASE 2 · CONSOLIDACIÓN LICEO' }
  return { target: 12, phaseLabel: 'FASE 1 · COHORTE INICIAL' }
}

function useCountUp(target: number, duration = 800, decimals = 0) {
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

  const horasCount = useCountUp(kpis.horasCertificadas, 800, 1)
  const alumnosCount = useCountUp(kpis.estudiantesAtendidos, 800, 0)
  const sesionesCount = useCountUp(kpis.sesionesValidadas, 800, 0)
  const asistenciaCount = useCountUp(kpis.tasaAsistencia, 800, 0)

  const isZeroAlumnos = kpis.estudiantesAtendidos === 0
  const isZeroSesiones = kpis.sesionesValidadas === 0
  const isZeroHoras = kpis.horasCertificadas === 0

  // Cálculo de meta colectiva escalable (12 -> 25 -> 50 -> 100)
  const { target: cohortTarget, phaseLabel: cohortPhaseLabel } = getCollectiveCohortTarget(kpis.estudiantesAtendidos)
  const cohortPct = Math.min(100, Math.round((kpis.estudiantesAtendidos / cohortTarget) * 100))
  const isTargetAchieved = kpis.estudiantesAtendidos >= cohortTarget

  return (
    <div className="space-y-4">
      {/* Grid de 4 KPIs Macro */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Total Horas Pedagógicas Donadas */}
        <div className="p-5 bg-white rounded-md border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Horas Donadas
            </span>
            <div className="flex size-6 items-center justify-center rounded bg-slate-100 text-slate-700">
              <Clock className="size-3.5" />
            </div>
          </div>
          <div className="mt-3.5">
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-mono">
              {isZeroHoras ? '0.0 h' : `${horasCount.toFixed(1)} h`}
            </p>
            <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
              {isZeroHoras ? (
                <span>0.0 h acumuladas — Primeras tutorías por registrar</span>
              ) : (
                <span>Horas Validadas · Distrito 10-04</span>
              )}
            </p>
          </div>
        </div>

        {/* KPI 2: Estudiantes en Refuerzo Activo */}
        <div className="p-5 bg-white rounded-md border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Refuerzo Activo
            </span>
            <div className="flex size-6 items-center justify-center rounded bg-slate-100 text-slate-700">
              <Users className="size-3.5" />
            </div>
          </div>
          <div className="mt-3.5">
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-mono">
              {alumnosCount} <span className="text-lg font-normal text-slate-400 font-sans">/ {cohortTarget}</span>
            </p>
            <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
              {isZeroAlumnos ? (
                <span className="text-indigo-700 font-medium inline-flex items-center gap-1">
                  <Sparkles className="size-3 shrink-0" /> Registra el primer estudiante de cohorte
                </span>
              ) : (
                <span>Meta Activa: {cohortTarget} Alumnos</span>
              )}
            </p>
          </div>
        </div>

        {/* KPI 3: Sesiones Impartidas */}
        <div className="p-5 bg-white rounded-md border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Sesiones Impartidas
            </span>
            <div className="flex size-6 items-center justify-center rounded bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="size-3.5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-3.5">
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-mono">
              {isZeroSesiones ? '0' : sesionesCount}
            </p>
            <p className="text-xs font-normal mt-1 leading-relaxed">
              {isZeroSesiones ? (
                <span className="text-slate-500">0 Sesiones — Inicia con la primera tutoría aprobada</span>
              ) : (
                <span className="text-emerald-700 font-medium">Aprobadas en Auditoría MINERD</span>
              )}
            </p>
          </div>
        </div>

        {/* KPI 4: Tasa de Asistencia / Compromiso */}
        <div className="p-5 bg-white rounded-md border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Asistencia
            </span>
            <div className="flex size-6 items-center justify-center rounded bg-slate-100 text-slate-700">
              <TrendingUp className="size-3.5" />
            </div>
          </div>
          <div className="mt-3.5">
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-mono">
              {`${asistenciaCount.toFixed(0)}%`}
            </p>
            <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
              Línea base institucional
            </p>
          </div>
        </div>
      </section>

      {/* Módulo Geométrico y Estructurado de Progreso de Cohorte */}
      <section className="border border-slate-200 bg-white rounded-md p-5 shadow-xs space-y-3">
        {/* Header Estructurado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              {cohortPhaseLabel}
            </span>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-900 font-sans">
              Avance Colectivo de la Cohorte PRAM
            </h3>
          </div>

          <div className="flex items-center gap-2 sm:justify-end">
            <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 tracking-tight uppercase">
              {kpis.estudiantesAtendidos} / {cohortTarget} ALUMNOS
            </span>
            <span className="font-mono text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
              {cohortPct}%
            </span>
          </div>
        </div>

        {/* Barra de Avance: Altura fija h-2, bg-slate-100, relleno sólido en bg-slate-900 (o emerald-600) */}
        <div className="w-full h-2 bg-slate-100 rounded-xs overflow-hidden border border-slate-200/50">
          <div
            className={`h-full transition-all duration-500 ${
              isTargetAchieved ? 'bg-emerald-600' : 'bg-slate-900'
            }`}
            style={{ width: `${Math.max(cohortPct > 0 ? cohortPct : (isZeroAlumnos ? 0 : cohortPct), 0)}%` }}
          />
        </div>

        {/* Subtexto Pragmático y Optimista */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-1 pt-0.5">
          <p className="font-normal">
            {isZeroAlumnos
              ? '0 / 12 Estudiantes en Refuerzo — Registro habilitado para iniciar el primer hito de la Cohorte 2026-2.'
              : `${kpis.estudiantesAtendidos} de ${cohortTarget} estudiantes recibiendo tutoría activa en Matemáticas y Lengua Española (Distrito 10-04).`}
          </p>
          <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider shrink-0 font-medium">
            Liceo Minerva Mirabal · MINERD
          </span>
        </div>
      </section>
    </div>
  )
}



