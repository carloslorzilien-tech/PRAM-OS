'use client'

import React from 'react'
import { Check, Clock, Play, Route, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePram } from '@/lib/pram-context'

// Default routes when no solicitudes exist
const defaultRoutes = [
  { id: 'm1', title: 'Despeje de variables', minutes: 8, done: true },
  { id: 'm2', title: 'Ecuaciones con paréntesis', minutes: 12, done: false },
  { id: 'm3', title: 'Problemas de aplicación', minutes: 15, done: false },
]

export function MicroRoutes() {
  const { solicitudes, requireAuth, currentUser } = usePram()

  // Merge solicitudes with default routes
  const routes = solicitudes.length > 0
    ? solicitudes.map((sol, i) => ({
        id: sol.id,
        title: sol.tema,
        minutes: 10 + (i * 5),
        done: sol.estado === 'Asignada',
      }))
    : defaultRoutes

  const handleStart = (routeId: string) => {
    requireAuth('iniciar una micro-ruta de aprendizaje', () => {
      // Future: mark route as started
    })
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <Route className="size-3.5" />
          </span>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
            Micro-Rutas de Aprendizaje
          </h3>
        </div>
        {solicitudes.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700">
            <Sparkles className="size-3" />
            {solicitudes.length} solicitud(es)
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500 font-normal mb-3">
        Cápsulas cortas de práctica para dominar el tema paso a paso.
      </p>

      <div className="flex flex-col gap-2">
        {routes.map((route, idx) => (
          <div
            key={route.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/70 p-3 transition-colors hover:bg-slate-100/70"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-medium',
                  route.done
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-white'
                )}
              >
                {route.done ? <Check className="size-3.5 stroke-[2.5]" /> : idx + 1}
              </span>

              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-900">
                  {route.title}
                </p>
                <p className="flex items-center gap-1 text-[11px] text-slate-500 font-normal mt-0.5">
                  <Clock className="size-3" />
                  {route.minutes} min de práctica
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleStart(route.id)}
              className={cn(
                'shrink-0 rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1',
                route.done
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              )}
            >
              {route.done ? (
                <>
                  <Check className="size-3 text-emerald-600" />
                  <span>Completado</span>
                </>
              ) : (
                'Iniciar'
              )}
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
