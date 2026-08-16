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
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
            <Route className="size-4 text-[#152642]" />
          </span>
          <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">
            Micro-Rutas de Aprendizaje
          </h3>
        </div>
        {solicitudes.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700">
            <Sparkles className="size-3" />
            {solicitudes.length} solicitud(es)
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500 font-medium mb-4">
        Cápsulas cortas de práctica para dominar el tema paso a paso.
      </p>

      <div className="flex flex-col gap-2.5">
        {routes.map((route, idx) => (
          <div
            key={route.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 transition-all hover:bg-slate-100/80 hover:shadow-2xs"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-2xs',
                  route.done
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#152642] text-white'
                )}
              >
                {route.done ? <Check className="size-4 stroke-[3]" /> : idx + 1}
              </span>

              <div className="min-w-0">
                <p className="truncate text-xs sm:text-sm font-bold text-slate-900">
                  {route.title}
                </p>
                <p className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mt-0.5">
                  <Clock className="size-3" />
                  {route.minutes} min de práctica
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleStart(route.id)}
              className={cn(
                'shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs',
                route.done
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-[#152642] text-white hover:bg-[#152642]/90'
              )}
            >
              {route.done ? 'Hecho ✓' : 'Iniciar'}
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
