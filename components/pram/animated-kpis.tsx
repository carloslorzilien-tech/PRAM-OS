'use client'

import React, { useEffect, useState } from 'react'
import { Clock, Users, CheckCircle2, TrendingUp } from 'lucide-react'

interface AnimatedKPIsProps {
  horasCertificadas: number
  estudiantesAtendidos: number
  sesionesValidadas: number
  tasaAsistencia: number
}

function useCountUp(target: number, duration = 1200, decimals = 0) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTimestamp: number | null = null
    const startValue = 0

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      // Ease out cubic
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
  const horasCount = useCountUp(horasCertificadas, 1200, 1)
  const alumnosCount = useCountUp(estudiantesAtendidos, 1200, 0)
  const sesionesCount = useCountUp(sesionesValidadas, 1200, 0)
  const asistenciaCount = useCountUp(tasaAsistencia, 1200, 1)

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* KPI 1: Horas Certificadas */}
      <div className="p-5 sm:p-6 bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Horas Certificadas
          </span>
          <div className="flex size-7 items-center justify-center rounded-md bg-slate-100 text-slate-700">
            <Clock className="size-3.5" />
          </div>
        </div>
        <div className="mt-4">
          {horasCertificadas === 0 ? (
            <div className="space-y-1">
              <p className="text-3xl font-bold text-slate-900 font-mono">0.0</p>
              <span className="inline-block rounded-md bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 text-[10px] font-medium font-mono">
                [ Meta: 60h ]
              </span>
            </div>
          ) : (
            <div>
              <p className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 font-mono">
                {horasCount.toFixed(1)}
              </p>
              <p className="text-xs text-slate-500 font-normal mt-1">
                Servicio Social Acreditado
              </p>
            </div>
          )}
        </div>
      </div>

      {/* KPI 2: Alumnos Atendidos */}
      <div className="p-5 sm:p-6 bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Alumnos Atendidos
          </span>
          <div className="flex size-7 items-center justify-center rounded-md bg-slate-100 text-slate-700">
            <Users className="size-3.5" />
          </div>
        </div>
        <div className="mt-4">
          {estudiantesAtendidos === 0 ? (
            <div className="space-y-1">
              <p className="text-3xl font-bold text-slate-900 font-mono">0</p>
              <span className="inline-block rounded-md bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 text-[10px] font-medium font-mono">
                [ Registro en Curso ]
              </span>
            </div>
          ) : (
            <div>
              <p className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 font-mono">
                {alumnosCount}
              </p>
              <p className="text-xs text-slate-500 font-normal mt-1">
                En cohortes de 3ro y 4to
              </p>
            </div>
          )}
        </div>
      </div>

      {/* KPI 3: Sesiones Validadas */}
      <div className="p-5 sm:p-6 bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Sesiones Validadas
          </span>
          <div className="flex size-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="size-3.5 text-emerald-600" />
          </div>
        </div>
        <div className="mt-4">
          {sesionesValidadas === 0 ? (
            <div className="space-y-1">
              <p className="text-3xl font-bold text-slate-900 font-mono">0</p>
              <span className="inline-block rounded-md bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 text-[10px] font-medium font-mono">
                [ Auditoría Pendiente ]
              </span>
            </div>
          ) : (
            <div>
              <p className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 font-mono">
                {sesionesCount}
              </p>
              <p className="text-xs text-emerald-700 font-medium mt-1">
                Aprobadas en Auditoría
              </p>
            </div>
          )}
        </div>
      </div>

      {/* KPI 4: Tasa de Asistencia */}
      <div className="p-5 sm:p-6 bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Tasa de Asistencia
          </span>
          <div className="flex size-7 items-center justify-center rounded-md bg-slate-100 text-slate-700">
            <TrendingUp className="size-3.5" />
          </div>
        </div>
        <div className="mt-4">
          {tasaAsistencia === 0 ? (
            <div className="space-y-1">
              <p className="text-3xl font-bold text-slate-900 font-mono">0%</p>
              <span className="inline-block rounded-md bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 text-[10px] font-medium font-mono">
                [ En Medición ]
              </span>
            </div>
          ) : (
            <div>
              <p className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 font-mono">
                {asistenciaCount.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500 font-normal mt-1">
                Compromiso de cohorte
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
