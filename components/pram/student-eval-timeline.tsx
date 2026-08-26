'use client'

import React, { useMemo } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  BookOpen,
  Award,
  GraduationCap,
} from 'lucide-react'
import { Evaluacion } from '@/lib/firebase-service'

export interface StudentEvalTimelineProps {
  notaInicial: number          // Fixed diagnostic grade
  evaluaciones: Evaluacion[]   // Sorted ascending by fecha
}

function formatScore(val: number | undefined | null): string {
  if (val === null || val === undefined || !Number.isFinite(val)) {
    return '--'
  }
  return Number.isInteger(val) ? `${val}` : val.toFixed(1)
}

function formatDelta(delta: number): string {
  if (!Number.isFinite(delta)) return '--'
  const rounded = Math.round(delta * 10) / 10
  const prefix = rounded > 0 ? '+' : ''
  return Number.isInteger(rounded) ? `${prefix}${rounded}` : `${prefix}${rounded.toFixed(1)}`
}

function formatFecha(fechaStr: string): string {
  if (!fechaStr) return ''
  try {
    const parts = fechaStr.split('-')
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const day = parseInt(parts[2], 10)
      const date = new Date(year, month, day)
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      }
    }
    const date = new Date(fechaStr)
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    }
  } catch {
    // fallback
  }
  return fechaStr
}

interface DeltaBadgeProps {
  delta: number
}

function DeltaBadge({ delta }: DeltaBadgeProps) {
  if (!Number.isFinite(delta)) return null
  const rounded = Math.round(delta * 10) / 10

  if (rounded > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
        <TrendingUp className="size-3.5 shrink-0" />
        <span>{formatDelta(rounded)}</span>
      </span>
    )
  }

  if (rounded < 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 border border-red-200">
        <TrendingDown className="size-3.5 shrink-0" />
        <span>{formatDelta(rounded)}</span>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500 border border-slate-200">
      <Minus className="size-3.5 shrink-0" />
      <span>0</span>
    </span>
  )
}

export function StudentEvalTimeline({
  notaInicial,
  evaluaciones,
}: StudentEvalTimelineProps) {
  const safeNotaInicial = Number.isFinite(notaInicial) ? notaInicial : 0

  const sortedEvaluaciones = useMemo(() => {
    if (!evaluaciones || !Array.isArray(evaluaciones)) return []
    return [...evaluaciones].sort((a, b) => (a.fecha || '').localeCompare(b.fecha || ''))
  }, [evaluaciones])

  const quizzes = useMemo(() => {
    return sortedEvaluaciones.filter((item) => item.tipo === 'QUIZ')
  }, [sortedEvaluaciones])

  const examenesFinales = useMemo(() => {
    return sortedEvaluaciones.filter((item) => item.tipo === 'EXAMEN_FINAL')
  }, [sortedEvaluaciones])

  const hasEvaluaciones = sortedEvaluaciones.length > 0

  return (
    <div className="w-full">
      <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6 pb-2">
        {/* 1. First node (always): Diagnóstico Inicial */}
        <div className="relative">
          <div className="absolute -left-[37px] top-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-white shadow-xs">
            <GraduationCap className="size-3.5" />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200 uppercase tracking-wider">
                DIAGNÓSTICO
              </span>
              <span className="text-xs font-medium text-slate-400">Punto de inicio</span>
            </div>

            <div className="mt-3 flex items-baseline justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                    {formatScore(notaInicial)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">/100</span>
                </div>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  Nota de entrada al programa
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Intermediate nodes: Quizzes */}
        {quizzes.map((quiz, index) => {
          const previousScore =
            index === 0
              ? safeNotaInicial
              : Number.isFinite(quizzes[index - 1].calificacion)
              ? quizzes[index - 1].calificacion
              : safeNotaInicial

          const currentScore = Number.isFinite(quiz.calificacion) ? quiz.calificacion : 0
          const delta = currentScore - previousScore

          return (
            <div key={quiz.id || `quiz-${index}`} className="relative">
              <div className="absolute -left-[37px] top-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white shadow-xs">
                <BookOpen className="size-3.5" />
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                      QUIZ
                    </span>
                    {quizzes.length > 1 && (
                      <span className="text-xs font-medium text-slate-400">
                        #{index + 1}
                      </span>
                    )}
                  </div>

                  {quiz.fecha && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <Calendar className="size-3.5 text-slate-400" />
                      <span>{formatFecha(quiz.fecha)}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                        {formatScore(quiz.calificacion)}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">/100</span>
                    </div>
                    {quiz.tema && (
                      <p className="text-sm font-semibold text-slate-800 mt-1">
                        {quiz.tema}
                      </p>
                    )}
                    {quiz.observacion && (
                      <p className="text-xs italic text-slate-500 mt-1.5 bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                        {quiz.observacion}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0">
                    <DeltaBadge delta={delta} />
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* 3. Final node: Examen Final */}
        {examenesFinales.map((examen, index) => {
          const finalScore = Number.isFinite(examen.calificacion) ? examen.calificacion : 0
          const totalDelta = finalScore - safeNotaInicial

          return (
            <div key={examen.id || `final-${index}`} className="relative">
              <div className="absolute -left-[37px] top-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-emerald-600 text-white shadow-xs">
                <Award className="size-3.5" />
              </div>

              <div className="rounded-xl border border-emerald-200 bg-white p-4 sm:p-5 shadow-xs ring-1 ring-emerald-500/10">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100 pb-3">
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                    <Award className="size-3.5" />
                    EXAMEN FINAL
                  </span>

                  {examen.fecha && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <Calendar className="size-3.5 text-slate-400" />
                      <span>{formatFecha(examen.fecha)}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                        {formatScore(examen.calificacion)}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">/100</span>
                    </div>
                    {examen.tema && (
                      <p className="text-sm font-semibold text-slate-800 mt-1">
                        {examen.tema}
                      </p>
                    )}
                    {examen.observacion && (
                      <p className="text-xs italic text-slate-500 mt-1.5 bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                        {examen.observacion}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <DeltaBadge delta={totalDelta} />
                    <p className="text-[11px] font-medium text-slate-500 mt-1">
                      Mejora total respecto al diagnóstico
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* 4. Empty state: If no evaluaciones */}
        {!hasEvaluaciones && (
          <div className="relative">
            <div className="absolute -left-[37px] top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-slate-500 shadow-xs">
              <Minus className="size-3.5" />
            </div>
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-5 text-center">
              <p className="text-xs font-medium text-slate-500">
                No hay evaluaciones registradas. Registra el primer quiz del alumno.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
