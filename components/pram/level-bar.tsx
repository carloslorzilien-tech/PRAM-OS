'use client'

import React from 'react'
import { TrendingUp, Award, CheckCircle2, Flame } from 'lucide-react'
import { usePram } from '@/lib/pram-context'
import { cn } from '@/lib/utils'

export function LevelBar() {
  const { estudiantes, estudiantesVisibles, currentUser } = usePram()
  const currentStudent = currentUser.role === 'estudiante' && currentUser.estudianteData ? currentUser.estudianteData : estudiantesVisibles[0] || estudiantes[0]

  const nivelActual = currentStudent?.nivel_actual || 3.0
  const scale = 5

  const nivelRankMap: Record<number, { title: string; rank: string; color: string; bg: string }> = {
    1: { title: 'Crítico', rank: 'Novato', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
    2: { title: 'Básico', rank: 'Aspirante', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
    3: { title: 'Funcional', rank: 'Avanzado', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    4: { title: 'Sólido', rank: 'Avanzado', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
    5: { title: 'Avanzado', rank: 'Élite', color: 'text-emerald-800', bg: 'bg-emerald-50 border-emerald-300' },
  }

  const currentRankInfo = nivelRankMap[Math.round(nivelActual)] || nivelRankMap[3]

  const delta =
    currentStudent?.nivel_pretest !== undefined
      ? nivelActual - currentStudent.nivel_pretest
      : 1.0

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
      {/* Header con Rango y Gamificación */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              RÚBRICA DE DOMINIO ACADÉMICO
            </span>
            <span className={cn('rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase', currentRankInfo.bg, currentRankInfo.color)}>
              RANGO: {currentRankInfo.rank}
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-black tracking-tight text-slate-900">
              {nivelActual.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              / 5.0 · Nivel <strong className="text-slate-800">{currentRankInfo.title}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentStudent?.racha_asistencia && currentStudent.racha_asistencia > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">
              <Flame className="size-3.5 text-amber-500 fill-amber-500" />
              <span className="font-mono">{currentStudent.racha_asistencia}</span> Racha
            </span>
          )}

          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
            <TrendingUp className="size-3.5 shrink-0" />
            <span className="font-mono">Δ Pre-Test: {delta >= 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}</span>
          </span>
        </div>
      </div>

      {/* 5 Bloques de Nivel (Gris neutro #E2E8F0 para no alcanzados, Rojo técnico #DC2626 o Verde #059669 para alcanzados) */}
      <div className="mt-5">
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((lvl) => {
            const isCompleted = nivelActual >= lvl
            return (
              <div key={lvl} className="flex flex-col gap-1.5 text-center">
                <div
                  className={cn(
                    'h-3.5 w-full rounded-full transition-all',
                    isCompleted
                      ? lvl <= 2
                        ? 'bg-red-600'
                        : lvl === 3
                        ? 'bg-blue-600'
                        : 'bg-emerald-600'
                      : 'bg-slate-200'
                  )}
                />
                <span className={cn('text-[11px] font-bold', isCompleted ? 'text-slate-900' : 'text-slate-400')}>
                  N{lvl}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Resumen de Rango */}
      <div className="mt-5 border-t border-slate-100 pt-3.5 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-medium">
          <CheckCircle2 className="size-3.5 text-emerald-600" />
          Pre-Test: <strong className="text-slate-800 font-bold">Nivel {currentStudent?.nivel_pretest || 2}</strong>
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <Award className="size-3.5 text-[#152642]" />
          Estatus: <strong className="text-slate-800 font-bold">{currentRankInfo.rank} (Medalla Activa)</strong>
        </span>
      </div>
    </section>
  )
}
