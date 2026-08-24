import React from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  Award,
  ArrowRight,
  BookOpen,
  FileCheck,
  Search,
} from 'lucide-react'
import { getPublicKPIs, getTopMentores } from '@/lib/db'
import { MainNav } from '@/components/pram/main-nav'
import { AnimatedKPIs } from '@/components/pram/animated-kpis'
import { HeroAuthActions } from '@/components/pram/hero-auth-actions'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const kpis = await getPublicKPIs()
  const topMentores = await getTopMentores(10)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      {/* 1. Header / Navbar Institucional */}
      <MainNav />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:py-14 space-y-12">
        {/* 2. Hero Institucional Minimalista y Tipográfico (Sin caja de logo gigante repetida) */}
        <section className="text-center py-6 sm:py-10 max-w-2xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-xs">
            <span className="size-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>PRAM OS · Liceo Minerva Mirabal · Período 2026-2</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              PRAM OS
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-bold uppercase tracking-widest font-mono">
              Programa de Refuerzo Académico Minerva Mirabal
            </p>
          </div>

          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-xl mx-auto">
            Sistema institucional para la gestión y registro ágil de tutorías pedagógicas, acreditación del servicio social (60 horas) y validación de certificados inmutables mediante código CUV.
          </p>

          {/* Botones de Acción Dinámicos según estado de sesión */}
          <HeroAuthActions />
        </section>

        {/* 3. Grid de 4 KPIs Gigantes con Animación Count-Up */}
        <AnimatedKPIs
          horasCertificadas={kpis.horasCertificadas}
          estudiantesAtendidos={kpis.estudiantesAtendidos}
          sesionesValidadas={kpis.sesionesValidadas}
          tasaAsistencia={kpis.tasaAsistencia}
        />

        {/* 4. Módulo de Verificación de CUV */}
        <section className="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-1.5 max-w-md">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-900">
                  <ShieldCheck className="size-4.5 text-slate-900" />
                </div>
                <h2 className="text-base font-bold tracking-tight text-slate-900">
                  Validador Oficial de Certificados CUV
                </h2>
              </div>
              <p className="text-xs text-slate-600 font-normal leading-relaxed">
                Verifica la autenticidad e inmutabilidad de cualquier expediente emitido por PRAM OS ingresando su Código Único de Verificación.
              </p>
            </div>

            <form
              action={async (formData) => {
                'use server'
                const { redirect } = await import('next/navigation')
                const cuv = formData.get('cuv') as string
                if (cuv && cuv.trim()) {
                  redirect(`/verify/${encodeURIComponent(cuv.trim().toUpperCase())}`)
                }
              }}
              className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto"
            >
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-3 size-4 text-slate-400" />
                <input
                  type="text"
                  name="cuv"
                  required
                  placeholder="Ej: PRAM-2026-M01-8841"
                  className="w-full pl-10 pr-3 py-2.5 text-xs font-mono uppercase bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-800 rounded-xl px-5 py-2.5 text-xs font-semibold shadow-sm transition-all cursor-pointer whitespace-nowrap"
              >
                Validar CUV
              </button>
            </form>
          </div>
        </section>

        {/* 5. Tabla: Cuadro de Honor de Mentores */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900">
                Cuadro de Honor de Mentores
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                Docentes y tutores con mayor aporte al programa de servicio social
              </p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Período 2026-2
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5 w-10">#</th>
                    <th className="px-5 py-3.5">Mentor</th>
                    <th className="px-5 py-3.5 hidden sm:table-cell">Especialidad</th>
                    <th className="px-5 py-3.5">Rango</th>
                    <th className="px-5 py-3.5 text-right">Horas</th>
                    <th className="px-5 py-3.5 text-right">Avance (60h)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {topMentores.map((mentor, index) => {
                    const pct = Math.min(100, Math.round((mentor.horas_acumuladas / mentor.meta_horas) * 100))
                    return (
                      <tr key={mentor.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-medium text-slate-400">
                          {index + 1}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-900">
                          <div>{mentor.nombre}</div>
                          <div className="text-[10px] text-slate-500 sm:hidden">{mentor.especialidad}</div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 font-normal hidden sm:table-cell">
                          {mentor.especialidad}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="rounded-lg bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-[10px] font-semibold">
                            {mentor.rango}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          {mentor.horas_acumuladas.toFixed(1)} h
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="inline-flex items-center gap-2 justify-end">
                            <div className="w-16 sm:w-20 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                              <div
                                className="h-full bg-slate-800 rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="font-mono text-[11px] font-bold text-slate-700">
                              {pct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 6. Enlaces de Acceso Rápido */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
          <Link
            href="/dashboard/mentor"
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Award className="size-4 text-slate-900" />
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-slate-800">
                  Panel del Tutor
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-normal">
                Registro ágil de tutorías y seguimiento en tiempo real de las 60 horas.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-900">
              <span>Ingresar</span>
              <ArrowRight className="size-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>

          <Link
            href="/dashboard/director"
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <FileCheck className="size-4 text-slate-900" />
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-slate-800">
                  Panel de Dirección
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-normal">
                Auditoría, aprobación ministerial y emisión atómica de diplomas CUV.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-900">
              <span>Ingresar</span>
              <ArrowRight className="size-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>

          <Link
            href="/recursos"
            className="p-5 bg-slate-900 text-white rounded-2xl shadow-sm hover:bg-slate-800 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <BookOpen className="size-4 text-slate-300" />
                <h3 className="text-sm font-bold text-white">
                  Recursos & Plantillas
                </h3>
              </div>
              <p className="text-xs text-slate-300 font-normal">
                Planillas de asistencia física y material pedagógico de apoyo.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-white">
              <span>Explorar Recursos</span>
              <ArrowRight className="size-3.5 text-slate-300 group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>
        </section>
      </main>

      {/* Footer Institucional */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500 mt-12">
        <p className="font-semibold text-slate-700">
          Programa de Refuerzo Académico Minerva Mirabal (PRAM OS) · República Dominicana
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          Liceo Minerva Mirabal · Sistema Oficial de Refuerzo y Servicio Social
        </p>
      </footer>
    </div>
  )
}
