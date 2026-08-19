'use client'

import React, { useState } from 'react'
import { submitOnboardingAction } from '@/app/actions'
import { UserPlus, GraduationCap, Award, CheckCircle2, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react'

interface OnboardingFormProps {
  email?: string
  nombre?: string
}

export function OnboardingForm({ email = '', nombre = '' }: OnboardingFormProps) {
  const [rol, setRol] = useState<'MENTOR' | 'STUDENT'>('MENTOR')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set('rol', rol)
    if (email) formData.set('email', email)
    if (nombre) formData.set('nombre', nombre)

    try {
      const res = await submitOnboardingAction(formData)
      if (res && !res.success) {
        setError(res.error || 'Error al guardar la solicitud')
        setIsSubmitting(false)
      }
    } catch {
      // Redirection throws NEXT_REDIRECT which is expected
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6 text-left">
      {/* Badge de cuenta Google vinculada automáticamente */}
      {email && (
        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700">
          <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
              Cuenta Google Verificada
            </span>
            <span className="font-semibold text-slate-900 truncate block">
              {email} {nombre ? `(${nombre})` : ''}
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-medium text-red-800">
          <AlertCircle className="size-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Hidden inputs para email y nombre extraídos automáticamente */}
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="nombre" value={nombre} />

      {/* CAMPO 1: Selección de Rol */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
          1. Rol Institucional
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRol('MENTOR')}
            className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all cursor-pointer ${
              rol === 'MENTOR'
                ? 'border-[#152642] bg-[#152642]/5 ring-1 ring-[#152642]'
                : 'border-slate-200 bg-slate-50/70 hover:border-slate-300'
            }`}
          >
            <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
              rol === 'MENTOR' ? 'bg-[#152642] text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              <Award className="size-4.5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block">Mentor / Tutor</span>
              <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                Acredita horas pedagógicas de servicio social
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setRol('STUDENT')}
            className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all cursor-pointer ${
              rol === 'STUDENT'
                ? 'border-[#152642] bg-[#152642]/5 ring-1 ring-[#152642]'
                : 'border-slate-200 bg-slate-50/70 hover:border-slate-300'
            }`}
          >
            <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
              rol === 'STUDENT' ? 'bg-[#152642] text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              <GraduationCap className="size-4.5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block">Estudiante</span>
              <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                Recibe refuerzo escolar y seguimiento de nivel
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* CAMPO 2: Según Rol elegido */}
      {rol === 'MENTOR' ? (
        <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block">
            2. Área Académica a Impartir
          </label>
          <select
            name="area"
            required
            defaultValue="Matemáticas"
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#152642]/10 focus:border-[#152642] cursor-pointer"
          >
            <option value="Matemáticas">Matemáticas</option>
            <option value="Lengua Española">Lengua Española</option>
          </select>
          <p className="text-[11px] text-slate-500 font-normal">
            PRAM OS enfoca sus tutorías exclusivamente en el refuerzo de Matemáticas y Lengua Española.
          </p>
        </div>
      ) : (
        <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block">
            2. Grado Escolar y Sección
          </label>
          <select
            name="grado"
            required
            defaultValue="3ro de Secundaria · Sección B"
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#152642]/10 focus:border-[#152642] cursor-pointer"
          >
            <option value="3ro de Secundaria · Sección A">3ro de Secundaria · Sección A</option>
            <option value="3ro de Secundaria · Sección B">3ro de Secundaria · Sección B</option>
            <option value="3ro de Secundaria · Sección C">3ro de Secundaria · Sección C</option>
            <option value="4to de Secundaria · Sección A">4to de Secundaria · Sección A</option>
            <option value="4to de Secundaria · Sección B">4to de Secundaria · Sección B</option>
            <option value="4to de Secundaria · Sección C">4to de Secundaria · Sección C</option>
          </select>
          <p className="text-[11px] text-slate-500 font-normal">
            Indica tu sección en el Liceo Minerva Mirabal para asignarte tu tutor pedagógico.
          </p>
        </div>
      )}

      {/* Botón Guardar / Enviar */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#152642] text-white hover:bg-[#1e3a5f] disabled:opacity-50 rounded-xl px-4 py-3 text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
      >
        <UserPlus className="size-4" />
        <span>{isSubmitting ? 'Guardando en Neon...' : 'Completar Perfil y Enviar a Revisión'}</span>
        <ArrowRight className="size-3.5" />
      </button>
    </form>
  )
}
