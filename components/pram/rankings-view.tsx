'use client'

import React, { useState } from 'react'
import {
  Trophy,
  Flame,
  Award,
  TrendingUp,
  User,
  Users,
  Sparkles,
} from 'lucide-react'
import { usePram } from '@/lib/pram-context'
import { cn } from '@/lib/utils'

export function RankingsView() {
  const { getRankingMentores, getRankingEstudiantes } = usePram()
  const [tab, setTab] = useState<'mentores' | 'estudiantes'>('mentores')

  const rankingMentores = getRankingMentores()
  const rankingEstudiantes = getRankingEstudiantes()

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 pb-8 px-1">
      {/* Encabezado del Motor de Rankings */}
      <section className="w-full rounded-xl border border-slate-200 bg-white p-5 text-center shadow-xs">
        <div className="mx-auto mb-2.5 flex size-10 items-center justify-center rounded-lg bg-slate-900 text-white">
          <Trophy className="size-5 text-slate-200" />
        </div>

        <h2 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900">
          Tablas de Clasificación PRAM
        </h2>
        <p className="mt-0.5 text-xs text-slate-500 font-normal">
          Gamificación pedagógica oficial · Medición de efectividad y esfuerzo MINERD
        </p>

        {/* Pestañas de Rankings */}
        <div className="mt-4 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setTab('mentores')}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors cursor-pointer',
              tab === 'mentores'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            <Award className="size-3.5 text-slate-700" />
            <span>Top Mentores</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('estudiantes')}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors cursor-pointer',
              tab === 'estudiantes'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            <Flame className="size-3.5 text-amber-600" />
            <span>Top Estudiantes</span>
          </button>
        </div>
      </section>

      {/* Tab 1: Ranking de Mentores */}
      {tab === 'mentores' && (
        <section className="space-y-2.5 w-full">
          <p className="text-center text-[11px] text-slate-400 font-normal">
            Criterio: (Horas acumuladas × 10) + (Delta de cohorte × 50)
          </p>

          <div className="space-y-2 w-full">
            {rankingMentores.map((item, idx) => {
              const isTop1 = idx === 0

              return (
                <div
                  key={item.mentor.id}
                  className="flex flex-row items-center justify-between p-3.5 w-full bg-white rounded-lg border border-slate-200 transition-colors shadow-xs gap-3"
                >
                  {/* Lado Izquierdo: Posición y Datos */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={cn(
                        'flex size-7 shrink-0 items-center justify-center rounded-md font-mono text-xs font-semibold',
                        isTop1
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600'
                      )}
                    >
                      {idx + 1}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                          {item.mentor.nombre}
                        </h4>
                        <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.2 text-[9px] font-medium text-slate-700">
                          {item.mentor.rango}
                        </span>
                        {isTop1 && (
                          <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.2 text-[9px] font-medium text-slate-700">
                            Puesto 1
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5 font-normal">
                        +{item.delta_promedio} Δ · {item.horas.toFixed(1)} h MINERD
                      </p>
                    </div>
                  </div>

                  {/* Lado Derecho: Badge de Puntos */}
                  <div className="bg-slate-900 text-white font-mono font-medium px-2.5 py-1 rounded-md text-xs shrink-0 flex items-center justify-center min-w-[64px]">
                    <span>{item.score} PTS</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Tab 2: Ranking de Estudiantes */}
      {tab === 'estudiantes' && (
        <section className="space-y-2.5 w-full">
          <p className="text-center text-[11px] text-slate-400 font-normal">
            Criterio: (Delta de nivel × 100) + (Racha de asistencia × 15)
          </p>

          <div className="space-y-2 w-full">
            {rankingEstudiantes.map((item, idx) => {
              const isTop1 = idx === 0

              return (
                <div
                  key={item.estudiante.id}
                  className="flex flex-row items-center justify-between p-3.5 w-full bg-white rounded-lg border border-slate-200 transition-colors shadow-xs gap-3"
                >
                  {/* Lado Izquierdo: Posición y Datos del Alumno */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={cn(
                        'flex size-7 shrink-0 items-center justify-center rounded-md font-mono text-xs font-semibold',
                        isTop1
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600'
                      )}
                    >
                      {idx + 1}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                          {item.estudiante.nombre}
                        </h4>
                        <span className="rounded-full bg-slate-100 border border-slate-200 px-1.5 py-0.2 text-[9px] font-medium uppercase text-slate-700">
                          {item.rango}
                        </span>
                        {isTop1 && (
                          <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.2 text-[9px] font-medium text-slate-700">
                            Puesto 1
                          </span>
                        )}
                      </div>
                      <p className="flex items-center gap-1 text-[11px] text-slate-500 truncate mt-0.5 font-normal">
                        <span>+{item.delta_nivel} Δ</span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-0.5">
                          <Flame className="size-3 text-amber-600" />
                          {item.racha} racha
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Lado Derecho: Badge de Puntos */}
                  <div className="bg-slate-900 text-white font-mono font-medium px-2.5 py-1 rounded-md text-xs shrink-0 flex items-center justify-center min-w-[64px]">
                    <span>{item.score} PTS</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
