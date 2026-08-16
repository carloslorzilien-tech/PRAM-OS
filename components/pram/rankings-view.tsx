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
    <div className="mx-auto w-full max-w-2xl space-y-5 pb-8 px-1">
      {/* Encabezado del Motor de Rankings */}
      <section className="w-full rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-[#152642] text-white shadow-xs">
          <Trophy className="size-6 text-amber-400" />
        </div>

        <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
          Tablas de Clasificación PRAM
        </h2>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Gamificación pedagógica oficial · Medición de efectividad y esfuerzo MINERD
        </p>

        {/* Pestañas de Rankings */}
        <div className="mt-4 grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setTab('mentores')}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer',
              tab === 'mentores'
                ? 'bg-white text-[#152642] shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            <Award className="size-3.5 text-[#152642]" />
            <span>Top Mentores</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('estudiantes')}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer',
              tab === 'estudiantes'
                ? 'bg-white text-[#152642] shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            <Flame className="size-3.5 text-amber-500" />
            <span>Top Estudiantes</span>
          </button>
        </div>
      </section>

      {/* Tab 1: Ranking de Mentores (Liderazgo y Efectividad) */}
      {tab === 'mentores' && (
        <section className="space-y-3 w-full">
          <div className="rounded-xl bg-slate-100 p-3 text-[11px] sm:text-xs text-slate-600 font-medium text-center border border-slate-200">
            Fórmula: <strong className="text-slate-900 font-bold">(Horas × 10) + (Delta Promedio × 50)</strong>
          </div>

          <div className="space-y-2.5 w-full">
            {rankingMentores.map((item, idx) => {
              const isTop1 = idx === 0
              const isTop2 = idx === 1
              const isTop3 = idx === 2

              return (
                <div
                  key={item.mentor.id}
                  className={cn(
                    'flex flex-row items-center justify-between p-4 w-full bg-white rounded-xl border transition-all shadow-2xs gap-3',
                    isTop1 ? 'border-amber-300 bg-amber-50/15' : 'border-slate-200'
                  )}
                >
                  {/* Lado Izquierdo: Posición y Datos */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-lg font-black text-xs shadow-2xs',
                        isTop1
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : isTop2
                          ? 'bg-slate-200 text-slate-800'
                          : isTop3
                          ? 'bg-amber-700/20 text-amber-900'
                          : 'bg-slate-100 text-slate-500'
                      )}
                    >
                      {idx + 1}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {item.mentor.nombre}
                        </h4>
                        <span className="rounded-full bg-[#152642]/10 px-2 py-0.2 text-[9px] font-bold text-[#152642]">
                          {item.mentor.rango}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        +{item.delta_promedio} Δ · {item.horas.toFixed(1)} h MINERD
                      </p>
                    </div>
                  </div>

                  {/* Lado Derecho: Badge de Puntos Flex Interno */}
                  <div className="bg-slate-900 text-white font-mono font-bold px-3 py-1.5 rounded-lg text-xs sm:text-sm shrink-0 flex items-center justify-center min-w-[72px] tracking-tight">
                    <span>{item.score} PTS</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Tab 2: Ranking de Estudiantes (Esfuerzo y Crecimiento) */}
      {tab === 'estudiantes' && (
        <section className="space-y-3 w-full">
          <div className="rounded-xl bg-slate-100 p-3 text-[11px] sm:text-xs text-slate-600 font-medium text-center border border-slate-200">
            Fórmula: <strong className="text-slate-900 font-bold">(Delta Nivel × 100) + (Racha × 15)</strong>
          </div>

          <div className="space-y-2.5 w-full">
            {rankingEstudiantes.map((item, idx) => {
              const isTop1 = idx === 0
              const isTop2 = idx === 1
              const isTop3 = idx === 2

              return (
                <div
                  key={item.estudiante.id}
                  className={cn(
                    'flex flex-row items-center justify-between p-4 w-full bg-white rounded-xl border transition-all shadow-2xs gap-3',
                    isTop1 ? 'border-amber-300 bg-amber-50/15' : 'border-slate-200'
                  )}
                >
                  {/* Lado Izquierdo: Posición y Datos del Alumno */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-lg font-black text-xs shadow-2xs',
                        isTop1
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : isTop2
                          ? 'bg-slate-200 text-slate-800'
                          : isTop3
                          ? 'bg-amber-700/20 text-amber-900'
                          : 'bg-slate-100 text-slate-500'
                      )}
                    >
                      {idx + 1}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {item.estudiante.nombre}
                        </h4>
                        <span className="rounded-full bg-slate-100 border border-slate-200 px-1.5 py-0.2 text-[9px] font-bold uppercase text-slate-700">
                          {item.rango}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        +{item.delta_nivel} Δ · {item.racha}🔥 Racha
                      </p>
                    </div>
                  </div>

                  {/* Lado Derecho: Badge de Puntos Flex Interno */}
                  <div className="bg-slate-900 text-white font-mono font-bold px-3 py-1.5 rounded-lg text-xs sm:text-sm shrink-0 flex items-center justify-center min-w-[72px] tracking-tight">
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
