import React from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Printer,
  ExternalLink,
  GraduationCap,
  Award,
  Download,
  CheckCircle2,
} from 'lucide-react'
import { PrintAttendanceTemplate } from '@/components/pram/print-template'

export const metadata = {
  title: 'Biblioteca de Recursos y Plantillas · PRAM OS',
  description: 'Materiales oficiales de apoyo, plantillas de asistencia ministerial y enlaces curriculares.',
}

export default function RecursosPage() {
  const externalResources = [
    {
      title: 'Khan Academy en Español',
      category: 'Plataforma de Práctica',
      description: 'Cursos interactivos alineados con matemáticas de secundaria, álgebra lineal, geometría y precálculo.',
      url: 'https://es.khanacademy.org/math',
      badge: 'Matemáticas',
    },
    {
      title: 'Adecuación Curricular MINERD (Nivel Secundario)',
      category: 'Documento Oficial',
      description: 'Malla curricular y competencias específicas para 3ro y 4to de bachillerato de República Dominicana.',
      url: 'https://www.ministeriodeeducacion.gob.do',
      badge: 'Currículo MINERD',
    },
    {
      title: 'Olimpíada Nacional de Matemáticas (ONM)',
      category: 'Entrenamiento Académico',
      description: 'Problemas y bancos de ejercicios de razonamiento lógico, combinatoria y teoría de números.',
      url: 'https://www.ministeriodeeducacion.gob.do',
      badge: 'Competencias',
    },
    {
      title: 'Guías de Lectura y Comprensión (MINERD)',
      category: 'Lengua Española',
      description: 'Estrategias pedagógicas de análisis textual, redacción de ensayos y análisis sintáctico.',
      url: 'https://www.ministeriodeeducacion.gob.do',
      badge: 'Español',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-8 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Volver al Portal"
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
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              PRAM OS · Materiales Pedagógicos
            </span>
            <h1 className="text-sm font-semibold tracking-tight text-slate-900 leading-tight">
              Biblioteca y Plantillas Oficiales
            </h1>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="text-xs font-medium text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition-colors"
        >
          Acceder al Panel
        </Link>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-8">
        {/* Sección 1: Plantilla Oficial de Asistencia (Imprimible) */}
        <section className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-slate-900" />
                <h2 className="text-sm font-semibold tracking-tight text-slate-900">
                  Plantilla Oficial de Asistencia y Bitácora PRAM
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-normal">
                Formato físico institucional para el registro de firmas de tutores y estudiantes.
              </p>
            </div>

            <PrintAttendanceTemplate />
          </div>

          {/* Vista previa limpia de la plantilla */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>Liceo Minerva Mirabal · Distrito 08-03</span>
              <span>Formato F-PRAM-01</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Mentor</span>
                <span className="font-medium text-slate-800">Nombre del Tutor</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Materia</span>
                <span className="font-medium text-slate-800">Asignatura</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Fecha</span>
                <span className="font-medium text-slate-800">DD / MM / 2026</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Horas</span>
                <span className="font-medium text-slate-800">45 - 90 min</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 italic">
              Haz clic en "Imprimir / Guardar como PDF" para generar el documento en hoja completa con la tabla de 10 alumnos y casillas de firma.
            </p>
          </div>
        </section>

        {/* Sección 2: Enlaces Curriculares y Recursos Externos */}
        <section className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-slate-900">
              Recursos Pedagógicos Recomendados
            </h2>
            <p className="text-xs text-slate-500 font-normal">
              Materiales alineados con el currículo dominicano y pruebas nacionales
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {externalResources.map((res) => (
              <a
                key={res.title}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all space-y-2 group block"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.2 text-[10px] font-medium">
                    {res.badge}
                  </span>
                  <ExternalLink className="size-3.5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-slate-800">
                  {res.title}
                </h3>
                <p className="text-xs text-slate-500 font-normal leading-relaxed">
                  {res.description}
                </p>
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
