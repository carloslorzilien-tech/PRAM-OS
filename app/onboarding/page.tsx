import React from 'react'
import Link from 'next/link'
import { ArrowLeft, UserPlus, GraduationCap, Award } from 'lucide-react'

export const metadata = {
  title: 'Registro Inicial · PRAM OS',
  description: 'Completa tu perfil para acceder al sistema de tutorías del Liceo Minerva Mirabal.',
}

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6 py-12">
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
          <p className="text-sm text-slate-600 font-normal leading-relaxed">
            Para acceder al sistema de tutorías, selecciona tu rol y completa tu perfil.
          </p>
        </div>

        {/* Selector de Rol */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Selecciona tu rol en el programa
          </label>

          <form
            action={async (formData) => {
              'use server'
              const { redirect } = await import('next/navigation')
              const role = formData.get('role') as string
              // En futuro: guardar en Neon con clerk userId
              redirect('/solicitud-pendiente')
            }}
            className="space-y-3"
          >
            <label className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors cursor-pointer">
              <input type="radio" name="role" value="MENTOR" defaultChecked className="accent-[#152642]" />
              <Award className="size-5 text-slate-600 shrink-0" />
              <div>
                <span className="text-sm font-semibold text-slate-900 block">Tutor / Mentor Académico</span>
                <span className="text-xs text-slate-500">Registro de horas pedagógicas y servicio social</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors cursor-pointer">
              <input type="radio" name="role" value="STUDENT" className="accent-[#152642]" />
              <GraduationCap className="size-5 text-slate-600 shrink-0" />
              <div>
                <span className="text-sm font-semibold text-slate-900 block">Estudiante</span>
                <span className="text-xs text-slate-500">Seguimiento de tutorías y asistencia recibida</span>
              </div>
            </label>

            <button
              type="submit"
              className="w-full bg-[#152642] text-white hover:bg-[#1e3a5f] rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition-all cursor-pointer mt-2"
            >
              <UserPlus className="size-4 inline mr-2" />
              Enviar Solicitud de Acceso
            </button>
          </form>
        </div>

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
