import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { OnboardingForm } from '@/components/pram/onboarding-form'

export const metadata = {
  title: 'Registro de Perfil · PRAM OS',
  description: 'Completa tu perfil para acceder al sistema de tutorías del Liceo Minerva Mirabal.',
}

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex items-center justify-center px-4 py-10">
      <div className="max-w-lg w-full space-y-6 text-center">
        {/* Header */}
        <div className="space-y-3">
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
            Registro de Perfil Institucional
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed max-w-sm mx-auto">
            Configura tu cuenta para vincularte a la base de datos oficial del Liceo Minerva Mirabal.
          </p>
        </div>

        {/* Formulario Interactivo */}
        <OnboardingForm />

        <div className="text-center pt-2">
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
