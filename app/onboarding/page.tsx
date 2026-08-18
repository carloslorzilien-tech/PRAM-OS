import React from 'react'
import Link from 'next/link'
import { ArrowLeft, UserPlus, GraduationCap, Award, BookOpen } from 'lucide-react'

export const metadata = {
  title: 'Registro Inicial · PRAM OS',
  description: 'Completa tu perfil para acceder al sistema de tutorías del Liceo Minerva Mirabal.',
}

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#152642] p-2.5 shadow-lg">
              <img
                src="/pram-logo.svg"
                alt="PRAM"
                className="size-full object-contain invert brightness-0 contrast-200"
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Bienvenido a PRAM OS
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
            Completa tu perfil institucional para vincular tu cuenta al sistema del Liceo Minerva Mirabal.
          </p>
        </div>

        {/* Formulario de Onboarding */}
        <form
          action={async (formData) => {
            'use server'
            const { redirect } = await import('next/navigation')
            redirect('/solicitud-pendiente')
          }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5"
        >
          {/* Selector de Rol */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
              1. Selecciona tu rol
            </label>

            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer">
                <input type="radio" name="role" value="MENTOR" defaultChecked className="accent-[#152642]" />
                <Award className="size-4 text-slate-700 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">Tutor / Mentor Académico</span>
                  <span className="text-[11px] text-slate-500">Registro de horas y acreditación de servicio social</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer">
                <input type="radio" name="role" value="STUDENT" className="accent-[#152642]" />
                <GraduationCap className="size-4 text-slate-700 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">Estudiante</span>
                  <span className="text-[11px] text-slate-500">Recepción de refuerzo pedagógico y seguimiento</span>
                </div>
              </label>
            </div>
          </div>

          {/* Grado / Sección */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
              2. Grado y Sección
            </label>
            <select
              name="grado"
              defaultValue="3ro-B"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            >
              <option value="3ro-A">3ro de Secundaria · Sección A</option>
              <option value="3ro-B">3ro de Secundaria · Sección B</option>
              <option value="3ro-C">3ro de Secundaria · Sección C</option>
              <option value="4to-A">4to de Secundaria · Sección A</option>
              <option value="4to-B">4to de Secundaria · Sección B</option>
              <option value="4to-C">4to de Secundaria · Sección C</option>
            </select>
          </div>

          {/* Área / Especialidad */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
              3. Área de Enfoque Pedagógico
            </label>
            <select
              name="area"
              defaultValue="Matemáticas"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            >
              <option value="Matemáticas">Matemáticas (Álgebra, Geometría, Precálculo)</option>
              <option value="Lengua Española">Lengua Española (Comprensión Textual, Análisis Sintáctico)</option>
              <option value="Ciencias">Ciencias de la Naturaleza</option>
              <option value="General">Refuerzo Académico General</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-[#152642] text-white hover:bg-[#1e3a5f] rounded-lg px-4 py-2.5 text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="size-3.5 inline mr-1.5" />
            Completar Registro y Enviar Solicitud
          </button>
        </form>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors"
          >
            <ArrowLeft className="size-3" />
            Volver al Portal Público
          </Link>
        </div>
      </div>
    </div>
  )
}
