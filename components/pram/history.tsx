'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { usePram } from '@/lib/pram-context'
import { CheckCircle2, Clock, CalendarDays } from 'lucide-react'

export function History() {
  const { sesionesVisibles, getEstudianteById, getMentorById, currentUser } = usePram()

  // Show recent sessions from actual context data
  const recentSessions = sesionesVisibles.slice(0, 5)

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
            <CalendarDays className="size-4 text-[#152642]" />
          </span>
          <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">
            Historial de Refuerzo
          </h3>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-bold text-slate-500">
          {recentSessions.length} sesiones
        </span>
      </div>

      <div className="mt-4 divide-y divide-slate-100">
        {recentSessions.length === 0 ? (
          <div className="py-8 text-center">
            <CalendarDays className="size-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-400">No hay sesiones registradas aún</p>
          </div>
        ) : (
          recentSessions.map((sesion) => {
            const completed = sesion.estado === 'Completada'
            const estudiante = getEstudianteById(sesion.estudiante_id)
            return (
              <div
                key={sesion.id}
                className="flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-full',
                      completed
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    )}
                  >
                    {completed ? <CheckCircle2 className="size-4" /> : <Clock className="size-4" />}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs sm:text-sm font-bold text-slate-900">
                      {sesion.tema}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {sesion.fecha_programada}{estudiante ? ` · ${estudiante.nombre}` : ''}
                    </p>
                  </div>
                </div>

                <span
                  className={cn(
                    'shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap',
                    completed
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
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
