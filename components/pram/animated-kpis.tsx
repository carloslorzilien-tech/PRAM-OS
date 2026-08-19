'use client'

import React, { useEffect, useState } from 'react'
import { Clock, Users, CheckCircle2, TrendingUp } from 'lucide-react'

interface AnimatedKPIsProps {
  horasCertificadas: number
  estudiantesAtendidos: number
  sesionesValidadas: number
  tasaAsistencia: number
}

function useCountUp(target: number, duration = 1000, decimals = 0) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (target === 0) {
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

  return count
}

export function AnimatedKPIs({
  horasCertificadas,
  estudiantesAtendidos,
  sesionesValidadas,
  tasaAsistencia,
}: AnimatedKPIsProps) {
  const horasCount = useCountUp(horasCertificadas, 1000, 1)
  const alumnosCount = useCountUp(estudiantesAtendidos, 1000, 0)
  const sesionesCount = useCountUp(sesionesValidadas, 1000, 0)
  const asistenciaCount = useCountUp(tasaAsistencia, 1000, 0)

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
            {horasCertificadas === 0 ? '0.0 h' : `${horasCount.toFixed(1)} h`}
          </p>
          <p className="text-xs text-slate-500 font-normal mt-1">
            Meta Cohorte: 60h Servicio Social
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
            {estudiantesAtendidos === 0 ? '0' : alumnosCount}
          </p>
          <p className="text-xs text-slate-500 font-normal mt-1">
            Cohortes de 3ro y 4to
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
            {sesionesValidadas === 0 ? '0' : sesionesCount}
          </p>
          <p className="text-xs text-emerald-700 font-medium mt-1">
            Aprobadas en Auditoría PRAM
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
            {tasaAsistencia === 0 ? '100%' : `${asistenciaCount.toFixed(0)}%`}
          </p>
          <p className="text-xs text-slate-500 font-normal mt-1">
            Línea base inicial
          </p>
        </div>
      </div>
    </section>
  )
}
