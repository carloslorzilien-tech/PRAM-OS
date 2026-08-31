'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Globe,
  Award,
  FileCheck,
  ArrowLeft,
  Clock,
  Users,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  PlusCircle,
  XCircle,
  Calendar,
} from 'lucide-react'
import { Mentor, Sesion, PublicKPIs } from '@/lib/db'
import { MentorSessionForm } from '@/components/pram/mentor-form'
import { DirectorAuditTable } from '@/components/pram/director-table'
import { AnimatedKPIs } from '@/components/pram/animated-kpis'

interface DemoTabsProps {
  kpis: PublicKPIs
  topMentores: Mentor[]
  mentorData: { mentor: Mentor; sesiones: Sesion[] }
  pendingSessions: Sesion[]
}

export function DemoTabsView({
  kpis,
  topMentores,
  mentorData,
  pendingSessions,
}: DemoTabsProps) {
  const [activeTab, setActiveTab] = useState<'public' | 'mentor' | 'director'>('public')

  const mentor = mentorData.mentor
  const metaHoras = mentor && Number.isFinite(mentor.meta_horas) && mentor.meta_horas > 0 ? mentor.meta_horas : 60
  const horasAcum = mentor && Number.isFinite(mentor.horas_acumuladas) ? mentor.horas_acumuladas : 0
  const pct = Math.min(100, Math.round((horasAcum / metaHoras) * 100))

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Header con Selector de Rol / Pestañas */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="flex h-16 w-full items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              title="Volver a Inicio"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div className="flex size-8 items-center justify-center rounded-lg bg-slate-900 p-1 shadow-sm shrink-0">
              <img
                src="/pram-logo.svg"
                alt="PRAM Logo"
                className="size-full object-contain invert brightness-0 contrast-200"
              />
            </div>
            <div className="bg-slate-900 text-white font-mono font-bold text-xs rounded-lg px-2.5 py-1">
              DEMO
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                PRAM OS · Simulador de Roles
              </span>
              <span className="text-[10px] text-slate-500 font-normal block leading-tight">
                Cambio de contexto en vivo sin autenticación
              </span>
            </div>
          </div>

          <Link
            href="/"
            className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors hidden sm:inline-block"
          >
            Salir al Portal
          </Link>
        </div>

        {/* Pestañas de Roles */}
        <div className="px-4 sm:px-8 pb-3 pt-1">
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1 max-w-lg mx-auto">
            <button
              type="button"
              onClick={() => setActiveTab('public')}
              className={`flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'public'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="size-3.5 text-slate-600" />
              <span>1. Vista Pública</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('mentor')}
              className={`flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'mentor'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="size-3.5 text-slate-600" />
              <span>2. Vista Tutor</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('director')}
              className={`flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'director'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck className="size-3.5 text-slate-600" />
              <span>3. Vista Director</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        {/* ============================================================== */}
        {/* TAB 1: VISTA PÚBLICA */}
        {/* ============================================================== */}
        {activeTab === 'public' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold text-slate-900">
                Rol Simulado: Visitante / Ciudadano / Estudiante
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px]">
                Sin Permisos Administrativos
              </span>
            </div>

            <AnimatedKPIs
              horasCertificadas={kpis.horasCertificadas}
              estudiantesAtendidos={kpis.estudiantesAtendidos}
              sesionesValidadas={kpis.sesionesValidadas}
              tasaAsistencia={kpis.tasaAsistencia}
            />

            <section className="p-6 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900">
                Cuadro de Honor (Período 2026-2)
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                {topMentores.map((m, idx) => (
                  <div key={m.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400 font-bold">{idx + 1}</span>
                      <span className="font-medium text-slate-900">{m.nombre}</span>
                      <span className="text-slate-500">({m.especialidad})</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">{m.horas_acumuladas.toFixed(1)} h</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: VISTA TUTOR / MENTOR */}
        {/* ============================================================== */}
        {activeTab === 'mentor' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold text-slate-900">
                Rol Simulado: Tutor Académico ({mentor.nombre})
              </span>
              <span className="rounded-md bg-slate-100 text-slate-700 px-2 py-0.5 font-mono text-[10px]">
                Rango: {mentor.rango}
              </span>
            </div>

            {/* Progreso hacia 60 horas */}
            <section className="p-6 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Acreditación 60 Horas Institucional
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-bold tracking-tight text-slate-900 font-mono">
                      {mentor.horas_acumuladas.toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-500">/ 60.0 horas ({pct}%)</span>
                  </div>
                </div>
              </div>

              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                <div
                  className="h-full bg-slate-800 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </section>

            {/* Formulario Rápido */}
            <section className="p-6 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900">
                Registrar Nueva Sesión de Refuerzo
              </h3>
              <MentorSessionForm mentorId={mentor.id} />
            </section>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: VISTA DIRECTOR / AUDITOR */}
        {/* ============================================================== */}
        {activeTab === 'director' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold text-slate-900">
                Rol Simulado: Dirección del Liceo Minerva Mirabal (Auditoría Institucional)
              </span>
              <span className="rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold">
                Firma Autorizada
              </span>
            </div>

            <section className="p-6 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-4">
              <DirectorAuditTable initialSessions={pendingSessions} />
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
