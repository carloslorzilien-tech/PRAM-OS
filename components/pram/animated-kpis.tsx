'use client'

import React, { useEffect, useState } from 'react'
import { Clock, Users, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react'
import { subscribeToRealtimeKPIs } from '@/lib/firebase-service'

export interface AnimatedKPIsProps {
  horasCertificadas?: number
  estudiantesAtendidos?: number
  sesionesValidadas?: number
  tasaAsistencia?: number
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

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* KPI 1: Horas Certificadas */}
      <div className="p-5 sm:p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Horas Certificadas
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
              <span className="text-slate-500">0 / 60h — Primeras horas de servicio por registrar</span>
            ) : (
              <span>Meta Cohorte: 60h Servicio Social</span>
            )}
          </p>
        </div>
      </div>

      {/* KPI 2: Alumnos Atendidos */}
      <div className="p-5 sm:p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Alumnos Atendidos
          </span>
          <div className="flex size-7 items-center justify-center rounded-md bg-slate-100 text-slate-700">
            <Users className="size-3.5" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 font-mono">
            {isZeroAlumnos ? '0 / 1' : alumnosCount}
          </p>
          <p className="text-xs text-slate-500 font-normal mt-1.5 leading-relaxed">
            {isZeroAlumnos ? (
              <span className="text-indigo-700 font-medium inline-flex items-center gap-1">
                <Sparkles className="size-3 shrink-0" /> Registra tu primer estudiante para iniciar el indicador de impacto
              </span>
            ) : (
              <span>Cohortes de 3ro y 4to de Secundaria</span>
            )}
          </p>
        </div>
      </div>

      {/* KPI 3: Sesiones Validadas */}
      <div className="p-5 sm:p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Sesiones Validadas
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
              <span className="text-slate-500">0 Sesiones — El contador oficial iniciará con la primera tutoría aprobada</span>
            ) : (
              <span className="text-emerald-700 font-medium">Aprobadas en Auditoría PRAM</span>
            )}
          </p>
        </div>
      </div>

      {/* KPI 4: Tasa de Asistencia */}
      <div className="p-5 sm:p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Tasa de Asistencia
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
  )
}

