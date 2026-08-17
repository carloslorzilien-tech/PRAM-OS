'use client'

import React from 'react'
import { TrendingUp, Award, CheckCircle2, Flame, GraduationCap } from 'lucide-react'
import { usePram } from '@/lib/pram-context'
import { cn } from '@/lib/utils'

export function LevelBar() {
  const { estudiantes, estudiantesVisibles, currentUser } = usePram()
  const currentStudent =
    currentUser.role === 'estudiante' && currentUser.estudianteData
      ? currentUser.estudianteData
      : estudiantesVisibles[0] || estudiantes[0]

  const nivelActual = currentStudent?.nivel_actual || 3.0

  const nivelRankMap: Record<number, { title: string; rank: string }> = {
    1: { title: 'Inicial', rank: 'Novato' },
    2: { title: 'Básico', rank: 'Aspirante' },
    3: { title: 'Intermedio', rank: 'Avanzado' },
    4: { title: 'Sólido', rank: 'Avanzado' },
    5: { title: 'Avanzado', rank: 'Dominio Completo' },
  }

  const currentRankInfo = nivelRankMap[Math.round(nivelActual)] || nivelRankMap[3]

  const delta =
    currentStudent?.nivel_pretest !== undefined
      ? nivelActual - currentStudent.nivel_pretest
      : 1.0

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
      {/* Header con Rango y Métricas en Flujo Normal Flex */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Rúbrica de Dominio Académico
            </span>
            <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
              Rango: {currentRankInfo.rank}
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold tracking-tight text-slate-900">
              {nivelActual.toFixed(1)}
            </span>
            <span className="text-xs font-normal text-slate-500">
              / 5.0 · Nivel <strong className="text-slate-800 font-semibold">{currentRankInfo.title}</strong>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentStudent?.racha_asistencia && currentStudent.racha_asistencia > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200/80 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
              <Flame className="size-3.5 text-amber-600" />
              <span className="font-mono">{currentStudent.racha_asistencia}</span> días racha
            </span>
          ) : null}

          <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            <TrendingUp className="size-3.5 text-slate-600 shrink-0" />
            <span className="font-mono">Δ Pre-Test: {delta >= 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}</span>
          </span>
        </div>
      </div>

      {/* 5 Bloques de Nivel — Escala Tonal Elegante (Slate-800 completado, Slate-200 incompleto) */}
      <div className="mt-5">
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((lvl) => {
            const isCompleted = nivelActual >= lvl
            return (
              <div key={lvl} className="flex flex-col gap-1.5 text-center">
                <div
                  className={cn(
                    'h-2.5 w-full rounded-sm transition-colors',
                    isCompleted ? 'bg-slate-800' : 'bg-slate-200'
                  )}
                />
                <span className={cn('text-[11px] font-medium', isCompleted ? 'text-slate-900 font-semibold' : 'text-slate-400')}>
                  N{lvl}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Resumen de Rango Académico */}
      <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2 font-normal">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="size-3.5 text-emerald-600" />
          Pre-Test: <strong className="text-slate-800 font-medium">Nivel {currentStudent?.nivel_pretest || 2}</strong>
        </span>
        <span className="flex items-center gap-1.5">
          <Award className="size-3.5 text-slate-700" />
          Estatus: <strong className="text-slate-800 font-medium">{currentRankInfo.rank}</strong>
        </span>
      </div>
    </section>
  )
}
