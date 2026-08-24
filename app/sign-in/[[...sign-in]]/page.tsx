import React from 'react'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Iniciar Sesión · PRAM OS',
  description: 'Accede al sistema de gestión pedagógica del Liceo Minerva Mirabal.',
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Header Institucional */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#152642] p-2.5 shadow-md transition-transform group-hover:scale-105">
            <img
              src="/pram-logo.svg"
              alt="PRAM Logo"
              className="size-full object-contain invert brightness-0 contrast-200"
            />
          </div>
          <div className="text-left">
            <span className="text-2xl font-bold tracking-tight text-slate-900 block leading-tight">
              PRAM OS
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 font-mono block">
              Liceo Minerva Mirabal
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-600 shadow-xs">
          <ShieldCheck className="size-3 text-emerald-500" />
          <span>Autenticación Institucional Segura (Firebase Auth)</span>
        </div>
      </div>

      {/* Widget Institucional de Acceso */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6 text-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Acceso al Sistema
          </h2>
          <p className="text-xs text-slate-500 font-normal mt-1">
            Inicia sesión con tu cuenta institucional para ingresar a tu panel de trabajo.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="flex w-full items-center justify-center gap-2.5 bg-[#152642] hover:bg-[#1e3a5f] text-white text-xs font-semibold py-3 px-4 rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <span>Acceder al Panel de Control</span>
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="mt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors"
        >
          <ArrowLeft className="size-3" />
          Volver al Portal Público
        </Link>
      </div>
    </div>
  )
}
