'use client'

import React, { useState } from 'react'
import { submitOnboardingAction } from '@/app/actions'
import { UserPlus, GraduationCap, Award, Mail, User, AlertCircle, ArrowRight } from 'lucide-react'

export function OnboardingForm({ initialEmail = '', initialName = '' }: { initialEmail?: string; initialName?: string }) {
  const [rol, setRol] = useState<'STUDENT' | 'MENTOR'>('MENTOR')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    formData.set('rol', rol)

    try {
      const res = await submitOnboardingAction(formData)
      if (res && !res.success) {
        setError(res.error || 'Error al enviar la solicitud')
        setIsSubmitting(false)
      }
    } catch {
      // Si hace redirect, next.js lanza error NEXT_REDIRECT que es normal
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5 text-left">
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-medium text-red-800">
          <AlertCircle className="size-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Selector de Rol */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
          1. Selecciona tu perfil institucional
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setRol('MENTOR')}
            className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              rol === 'MENTOR'
                ? 'border-[#152642] bg-[#152642]/5 ring-1 ring-[#152642]'
                : 'border-slate-200 bg-slate-50/70 hover:border-slate-300'
            }`}
          >
            <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
              rol === 'MENTOR' ? 'bg-[#152642] text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              <Award className="size-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Tutor / Mentor</span>
              <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                Acredita horas pedagógicas de servicio social
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setRol('STUDENT')}
            className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              rol === 'STUDENT'
                ? 'border-[#152642] bg-[#152642]/5 ring-1 ring-[#152642]'
                : 'border-slate-200 bg-slate-50/70 hover:border-slate-300'
            }`}
          >
            <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
              rol === 'STUDENT' ? 'bg-[#152642] text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              <GraduationCap className="size-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Estudiante</span>
              <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                Recibe refuerzo escolar y tutorías
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Datos de Contacto */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Nombre Completo
          </label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <input
              type="text"
              name="nombre"
              required
              defaultValue={initialName}
              placeholder="Ej. Juan Pérez"
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Correo Institucional / Google
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <input
              type="email"
              name="email"
              required
              defaultValue={initialEmail}
              placeholder="usuario@gmail.com"
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
          </div>
        </div>
      </div>

      {/* 3. Campo Condicional según Rol */}
      {rol === 'MENTOR' ? (
        <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <label className="text-xs font-bold text-slate-900 block">
            Área Pedagógica a Impartir (Exclusivo PRAM OS)
          </label>
          <select
            name="area"
            required
            defaultValue="Matemáticas"
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 cursor-pointer"
          >
            <option value="Matemáticas">Matemáticas</option>
            <option value="Lengua Española">Lengua Española</option>
          </select>
          <p className="text-[11px] text-slate-500 font-normal mt-1">
            PRAM OS enfoca sus tutorías exclusivamente en el refuerzo de Matemáticas y Lengua Española.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <label className="text-xs font-bold text-slate-900 block">
            Grado y Sección de Secundaria
          </label>
          <select
            name="grado"
            required
            defaultValue="3ro - Sección B"
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 cursor-pointer"
          >
            <option value="3ro - Sección A">3ro de Secundaria · Sección A</option>
            <option value="3ro - Sección B">3ro de Secundaria · Sección B</option>
            <option value="3ro - Sección C">3ro de Secundaria · Sección C</option>
            <option value="4to - Sección A">4to de Secundaria · Sección A</option>
            <option value="4to - Sección B">4to de Secundaria · Sección B</option>
            <option value="4to - Sección C">4to de Secundaria · Sección C</option>
          </select>
          <p className="text-[11px] text-slate-500 font-normal mt-1">
            Indica tu sección oficial en el Liceo Minerva Mirabal para asignarte tutor.
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
        <span>{isSubmitting ? 'Guardando registro en Neon...' : 'Enviar Solicitud de Acceso'}</span>
        <ArrowRight className="size-3.5" />
      </button>
    </form>
  )
}
