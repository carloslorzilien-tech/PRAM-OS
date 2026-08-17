'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { usePram } from '@/lib/pram-context'
import { CheckCircle2, Clock, CalendarDays } from 'lucide-react'

export function History() {
  const { sesionesVisibles, getEstudianteById } = usePram()

  const recentSessions = sesionesVisibles.slice(0, 5)

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <CalendarDays className="size-3.5" />
          </span>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
            Historial de Refuerzo
          </h3>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          {recentSessions.length} sesiones
        </span>
      </div>

      <div className="mt-3 divide-y divide-slate-100">
        {recentSessions.length === 0 ? (
          <div className="py-8 text-center">
            <CalendarDays className="size-7 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-normal text-slate-400">No hay sesiones registradas aún</p>
          </div>
        ) : (
          recentSessions.map((sesion) => {
            const completed = sesion.estado === 'Completada'
            const estudiante = getEstudianteById(sesion.estudiante_id)
            return (
              <div
                key={sesion.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      'flex size-6 shrink-0 items-center justify-center rounded-full',
                      completed
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    )}
                  >
                    {completed ? <CheckCircle2 className="size-3.5" /> : <Clock className="size-3.5" />}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs sm:text-sm font-semibold text-slate-900">
                      {sesion.tema}
                    </p>
                    <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                      {sesion.fecha_programada}{estudiante ? ` · ${estudiante.nombre}` : ''}
                    </p>
                  </div>
                </div>

                <span
                  className={cn(
                    'shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium whitespace-nowrap',
                    completed
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                  )}
                >
                  {completed ? 'Completado' : sesion.estado === 'Programada' ? 'Pendiente' : sesion.estado}
                </span>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
