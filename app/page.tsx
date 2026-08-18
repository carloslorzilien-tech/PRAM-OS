import React from 'react'
import Link from 'next/link'
import {
  Clock,
  Users,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Award,
  ArrowRight,
  BookOpen,
  FileCheck,
  Search,
  ExternalLink,
  GraduationCap,
  PlayCircle,
} from 'lucide-react'
import { getPublicKPIs, getTopMentores } from '@/lib/db'
import { MainNav } from '@/components/pram/main-nav'
import { AnimatedKPIs } from '@/components/pram/animated-kpis'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const kpis = await getPublicKPIs()
  const topMentores = await getTopMentores(10)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      {/* 1. Header / Navbar Institucional con Branding Reforzado */}
      <MainNav />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:py-12 space-y-10">
        {/* 2. Hero Institucional — Logo PRAM M grande + texto, responsive */}
        <section className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-14 py-6 md:py-10 max-w-3xl mx-auto">
          {/* Isotipo "M" de PRAM — escalado grande */}
          <div className="flex-shrink-0 flex items-center justify-center size-28 sm:size-36 md:size-44 rounded-2xl md:rounded-3xl bg-slate-900 shadow-lg p-4 md:p-6">
            <img
              src="/pram-logo.svg"
              alt="PRAM M Logo"
              className="size-full object-contain invert brightness-0 contrast-200 select-none"
              draggable={false}
            />
          </div>

          {/* Bloque de Texto Institucional */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3 max-w-md">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3.5 py-1 text-[11px] font-medium text-slate-700 shadow-xs">
              <span className="size-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span>Plataforma Oficial MINERD · Período 2026-2</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-none">
              PRAM OS
            </h1>
            <p className="text-sm text-slate-500 font-semibold uppercase tracking-widest">
              Liceo Minerva Mirabal
            </p>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              Gestión inmutable de horas de tutoría, acreditación ministerial de servicio social (60h) y emisión de certificados verificables por código CUV.
            </p>
          </div>
        </section>

        {/* 3. Grid de 4 KPIs Gigantes con Animación Count-Up y Manejo Día-0 */}
        <AnimatedKPIs
          horasCertificadas={kpis.horasCertificadas}
          estudiantesAtendidos={kpis.estudiantesAtendidos}
          sesionesValidadas={kpis.sesionesValidadas}
          tasaAsistencia={kpis.tasaAsistencia}
        />

        {/* 4. Módulo de Verificación de CUV */}
        <section className="p-6 bg-white rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="space-y-1 max-w-md">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-slate-900" />
                <h2 className="text-base font-semibold tracking-tight text-slate-900">
                  Validador de Certificados CUV
                </h2>
              </div>
              <p className="text-xs text-slate-600 font-normal">
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
              className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto"
            >
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
                <input
                  type="text"
                  name="cuv"
                  required
                  placeholder="Ej: PRAM-2026-M01-8841"
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-800 rounded-lg px-4 py-2 text-xs font-medium shadow-sm transition-all cursor-pointer whitespace-nowrap"
              >
                Validar CUV
              </button>
            </form>
          </div>
        </section>

        {/* 5. Tabla Secundaria: Top Mentores por Horas Aportadas (Totalmente Responsive) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-slate-900">
                Cuadro de Honor de Mentores
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                Docentes y tutores con mayor aporte al servicio social MINERD
              </p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Período 2026-2
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3 w-10">#</th>
                    <th className="px-4 py-3">Mentor</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Especialidad</th>
                    <th className="px-4 py-3">Rango</th>
                    <th className="px-4 py-3 text-right">Horas</th>
                    <th className="px-4 py-3 text-right">Avance (60h)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {topMentores.map((mentor, index) => {
                    const pct = Math.min(100, Math.round((mentor.horas_acumuladas / mentor.meta_horas) * 100))
                    return (
                      <tr key={mentor.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono font-medium text-slate-400">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          <div>{mentor.nombre}</div>
                          <div className="text-[10px] text-slate-500 sm:hidden">{mentor.especialidad}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-normal hidden sm:table-cell">
                          {mentor.especialidad}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-md bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 text-[10px] font-medium">
                            {mentor.rango}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900 whitespace-nowrap">
                          {mentor.horas_acumuladas.toFixed(1)} h
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-2 justify-end">
                            <div className="w-14 sm:w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-slate-800 rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="font-mono text-[11px] font-medium text-slate-600">
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

        {/* 6. Enlaces de Acceso Rápido y Demo */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
          <Link
            href="/dashboard/mentor"
            className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Award className="size-4 text-slate-900" />
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-slate-800">
                  Panel del Tutor
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-normal mt-1">
                Registro ágil de horas pedagógicas y seguimiento a las 60h.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-[11px] font-medium text-slate-900">
              <span>Ingresar</span>
              <ArrowRight className="size-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>

          <Link
            href="/dashboard/director"
            className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileCheck className="size-4 text-slate-900" />
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-slate-800">
                  Panel de Dirección
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-normal mt-1">
                Auditoría y bloqueo inmutable de sesiones MINERD.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-[11px] font-medium text-slate-900">
              <span>Ingresar</span>
              <ArrowRight className="size-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>

          <Link
            href="/demo"
            className="p-5 bg-slate-900 text-white rounded-xl shadow-sm hover:bg-slate-800 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <PlayCircle className="size-4 text-slate-300" />
                <h3 className="text-sm font-semibold text-white">
                  Demo de Roles
                </h3>
              </div>
              <p className="text-xs text-slate-300 font-normal mt-1">
                Prueba instantáneamente las 3 vistas en vivo sin iniciar sesión.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-[11px] font-medium text-white">
              <span>Ver Demo Interactiva</span>
              <ArrowRight className="size-3.5 text-slate-300 group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>
        </section>
      </main>

      {/* Footer Institucional */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500 mt-12">
        <p className="font-normal">
          Programa de Refuerzo Académico Minerva Mirabal (PRAM OS) · República Dominicana
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          Acreditado bajo normativas del Ministerio de Educación (MINERD)
        </p>
      </footer>
    </div>
  )
}
