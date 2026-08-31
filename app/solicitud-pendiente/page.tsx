'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Clock,
  ShieldAlert,
  CheckCircle2,
  ArrowLeft,
  LogOut,
  HelpCircle,
  School,
  Mail,
  UserCheck,
} from 'lucide-react'
import { useFirebaseAuth } from '@/lib/firebase-auth'

export default function SolicitudPendientePage() {
  const { user, userProfile, signOut, loading } = useFirebaseAuth()

  const userName = user?.displayName || userProfile?.nombre || 'Docente / Tutor'
  const userEmail = user?.email || '—'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-slate-900 selection:text-white">
      {/* Header Institucional */}
      <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-slate-900 p-1.5 shadow-sm shrink-0">
            <Image
              src="/pram-logo.svg"
              alt="PRAM Logo"
              width={36}
              height={31}
              className="size-full object-contain invert brightness-0 contrast-200"
            />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 block leading-none">
              PRAM OS
            </span>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-tight font-mono block leading-tight mt-0.5">
              Liceo Minerva Mirabal · Distrito 10-04
            </span>
          </div>
        </Link>

        {user && (
          <button
            type="button"
            onClick={() => signOut()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
          >
            <LogOut className="size-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        )}
      </header>

      {/* Main Content: Módulo Profesional de Pantalla Completa */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full space-y-6">
          {/* Card Principal */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            {/* Header del Estatus */}
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-4 py-1 text-xs font-semibold text-amber-800 shadow-2xs">
                  <Clock className="size-3.5 text-amber-600 animate-pulse" />
                  <span>Pendiente de Auditoría y Validación</span>
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Cuenta en Proceso de Acreditación Institucional
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed max-w-sm mx-auto">
                La Dirección del <strong>Liceo Minerva Mirabal (Distrito 10-04)</strong> debe validar y activar tu perfil docente antes de permitir el registro de tutorías pedagógicas.
              </p>
            </div>

            {/* Ficha de Información de la Cuenta */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                  Docente Solicitante
                </span>
                <span className="font-bold text-slate-900">{userName}</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                  Correo Electrónico
                </span>
                <span className="font-mono text-slate-700">{userEmail}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                  Rol Asignado por Defecto
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-slate-200/70 px-2 py-0.5 font-semibold text-slate-800 text-[10px]">
                  Tutor / Mentor PRAM
                </span>
              </div>
            </div>

            {/* Checklist Institucional de Activación */}
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                Fases de Verificación
              </span>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-900">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">1. Identidad Institucional Verificada</span>
                    <span className="text-[11px] text-emerald-700 font-normal">Cuenta vinculada correctamente vía Google Auth.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-900">
                  <Clock className="size-4 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <span className="font-semibold block">2. Aprobación por Dirección Académica</span>
                    <span className="text-[11px] text-amber-800 font-normal">
                      En cola de revisión en el panel de Dirección para asignación formal de asignatura y grupo de servicio social.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500">
                  <UserCheck className="size-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-slate-700">3. Habilitación de Registro de Horas</span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      Una vez aprobado, tendrás acceso completo a registrar tutorías y computar tus 60 horas.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
              >
                <ArrowLeft className="size-3.5" />
                <span>Volver al Portal Público</span>
              </Link>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer"
              >
                <span>Verificar Estado Actual</span>
              </button>
            </div>
          </div>

          {/* Nota de Ayuda */}
          <div className="flex items-center justify-center gap-2 text-center text-xs text-slate-400">
            <HelpCircle className="size-3.5" />
            <span>¿Requieres activación urgente? Contacta a la Dirección del Liceo Minerva Mirabal.</span>
          </div>
        </div>
      </main>

      {/* Footer Institucional */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-700">
          Programa de Refuerzo Académico Minerva Mirabal (PRAM OS) · República Dominicana
        </p>
      </footer>
    </div>
  )
}

