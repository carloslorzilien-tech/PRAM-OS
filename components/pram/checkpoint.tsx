'use client'

import React from 'react'
import { ClipboardCheck, CheckCircle2, Circle, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePram } from '@/lib/pram-context'

const criteriaByLevel: Record<number, { label: string; done: boolean }[]> = {
  1: [
    { label: 'Identifica los términos de una ecuación lineal', done: false },
    { label: 'Reconoce la incógnita y los coeficientes', done: false },
    { label: 'Aplica operaciones inversas básicas', done: false },
    { label: 'Verifica sustituyendo en la ecuación original', done: false },
  ],
  2: [
    { label: 'Identifica los términos de una ecuación lineal', done: true },
    { label: 'Reconoce la incógnita y los coeficientes', done: false },
    { label: 'Aplica operaciones inversas y transposición correcta', done: false },
    { label: 'Verifica sustituyendo en la ecuación original', done: false },
  ],
  3: [
    { label: 'Identifica la incógnita lineal y sus coeficientes', done: true },
    { label: 'Aplica operaciones inversas y transposición correcta de términos', done: true },
    { label: 'Verifica la solución sustituyendo en la ecuación original', done: false },
    { label: 'Modela y resuelve problema verbal de aplicación real', done: false },
  ],
  4: [
    { label: 'Identifica la incógnita lineal y sus coeficientes', done: true },
    { label: 'Aplica operaciones inversas y transposición correcta de términos', done: true },
    { label: 'Verifica la solución sustituyendo en la ecuación original', done: true },
    { label: 'Modela y resuelve problema verbal de aplicación real', done: false },
  ],
  5: [
    { label: 'Identifica la incógnita lineal y sus coeficientes', done: true },
    { label: 'Aplica operaciones inversas y transposición correcta de términos', done: true },
    { label: 'Verifica la solución sustituyendo en la ecuación original', done: true },
    { label: 'Modela y resuelve problema verbal de aplicación real', done: true },
  ],
}

export function Checkpoint() {
  const { currentUser, estudiantesVisibles, isGuestMode } = usePram()

  const student = currentUser.role === 'estudiante' && currentUser.estudianteData
    ? currentUser.estudianteData
    : estudiantesVisibles[0]

  const nivel = student ? Math.round(student.nivel_actual) : 3
  const criteria = criteriaByLevel[nivel] || criteriaByLevel[3]
  const done = criteria.filter((c) => c.done).length

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#152642]/10 text-[#152642]">
            <ClipboardCheck className="size-5" />
          </span>
          <div>
            <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">
              Checkpoint de Dominio
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {student ? `${student.nombre} · Nivel ${nivel}` : 'Criterios pedagógicos evaluados'}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
          {done} de {criteria.length} listos
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        {criteria.map((c) => (
          <div
            key={c.label}
            className={cn(
              'flex items-center gap-3.5 rounded-2xl border p-3.5 transition-all',
              c.done
                ? 'border-emerald-200 bg-emerald-50/50'
                : 'border-slate-100 bg-slate-50/60'
            )}
          >
            {c.done ? (
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
            ) : (
              <Circle className="size-5 text-slate-300 shrink-0" />
            )}
            <span
              className={cn(
                'text-xs sm:text-sm font-medium leading-snug',
                c.done ? 'text-slate-900 font-bold' : 'text-slate-600'
              )}
            >
              {c.label}
            </span>
          </div>
        ))}
      </div>

      {isGuestMode && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-100 p-3 text-[11px] text-slate-500">
          <Lock className="size-3.5 text-slate-400 shrink-0" />
          <span>Inicia sesión para ver tu progreso personalizado</span>
        </div>
      )}
    </section>
  )
}
