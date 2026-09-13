import React from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  BookOpen,
  FileText,
  ExternalLink,
  LogIn,
  ClipboardList,
  ShieldCheck,
} from 'lucide-react'
import { PrintAttendanceTemplate } from '@/components/pram/print-template'
import { PrintEvalTemplate } from '@/components/pram/print-eval-template'

export const metadata = {
  title: 'Recursos, Guía de Uso y Plantillas · PRAM OS',
  description: 'Guía visual para docentes, plantillas oficiales F-PRAM-01 y recursos pedagógicos · Liceo Minerva Mirabal.',
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
      title: 'Biblioteca y Recursos de Lengua Española',
      category: 'Lengua Española',
      description: 'Obras clásicas, análisis textual, recursos de comprensión lectora y materiales de estudio literario.',
      url: 'https://www.cervantesvirtual.com/nd/ark:/59851/bmc1220428',
      badge: 'Lengua Española',
    },
  ]

  const guideSteps = [
    {
      step: '1',
      icon: LogIn,
      title: 'Acceder con Google',
      description: 'Abre PRAM OS desde el celular o computadora y haz clic en "Iniciar con Google". La Dirección del Liceo aprobará tu cuenta para habilitar el registro de sesiones.',
      detail: 'Solo necesitas tu cuenta de Gmail. No hay contraseñas adicionales.',
    },
    {
      step: '2',
      icon: ClipboardList,
      title: 'Registrar Sesión y Evaluar',
      description: 'Desde tu panel, registra cada tutoría en 4 campos: Materia, Duración, Tema y Cantidad de Alumnos. Luego, en "Mis Alumnos", asienta la nota del examen físico que corregiste en papel.',
      detail: 'El formulario toma menos de 30 segundos. La nota se guarda de forma inmutable.',
    },
    {
      step: '3',
      icon: ShieldCheck,
      title: 'Dirección Aprueba y Emite CUV',
      description: 'La Dirección revisa las sesiones pendientes, coteja con la carpeta física F-PRAM y aprueba con un clic. El sistema genera automáticamente el certificado CUV verificable.',
      detail: 'El código CUV es inmutable: nadie puede modificarlo ni borrarlo después de emitido.',
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
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              PRAM OS · Materiales y Guía de Uso
            </span>
            <h1 className="text-sm font-semibold tracking-tight text-slate-900 leading-tight">
              Recursos y Documentación
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

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-10">

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECCIÓN 1: GUÍA VISUAL DE USO PARA PRINCIPIANTES          */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="space-y-5">
          <div className="space-y-1">
            <h2 className="text-base font-bold tracking-tight text-slate-900">
              Guía Rápida: Cómo Usar PRAM OS
            </h2>
            <p className="text-xs text-slate-500 font-normal">
              3 pasos para registrar tutorías, asentar evaluaciones y obtener tu certificado CUV.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {guideSteps.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.step}
                  className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3"
                >
                  {/* Número del paso */}
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-slate-900 text-white font-mono text-lg font-bold shrink-0">
                      {item.step}
                    </span>
                    <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 shrink-0">
                      <Icon className="size-4" />
                    </div>
                  </div>

                  {/* Título */}
                  <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                    {item.title}
                  </h3>

                  {/* Descripción */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Detalle */}
                  <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-100 pt-2">
                    {item.detail}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Nota sobre el flujo físico + digital */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-1.5">
            <p className="font-semibold text-slate-800">
              Modelo Phygital (Físico + Digital)
            </p>
            <p>
              Los exámenes se aplican y corrigen en papel (Pre-Test, Quiz, Post-Test). El tutor asienta la nota en PRAM OS
              y archiva la hoja en la carpeta física F-PRAM del Liceo. Esto garantiza autenticidad pedagógica y respaldo legal.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECCIÓN 2: PLANTILLAS OFICIALES F-PRAM-01                 */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="space-y-5">
          <div className="space-y-1">
            <h2 className="text-base font-bold tracking-tight text-slate-900">
              Plantillas Oficiales F-PRAM-01
            </h2>
            <p className="text-xs text-slate-500 font-normal">
              Formatos imprimibles para el registro físico de asistencia y evaluaciones.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tarjeta 1: Asistencia */}
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-slate-900" />
                <h3 className="text-sm font-semibold tracking-tight text-slate-900">
                  Control de Asistencia
                </h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Hoja de registro con tabla para 10 estudiantes, firmas del tutor y validación de la Dirección. Úsala en cada sesión de tutoría.
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-2">
                <span>Formato F-PRAM-01 · Asistencia</span>
              </div>
              <PrintAttendanceTemplate />
            </div>

            {/* Tarjeta 2: Evaluación */}
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="size-4 text-slate-900" />
                <h3 className="text-sm font-semibold tracking-tight text-slate-900">
                  Hoja de Evaluación
                </h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Formato para Pre-Test, Quiz o Post-Test con área de desarrollo, puntaje /100 y firmas. Corrige en papel y asienta la nota en PRAM OS.
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-2">
                <span>Formato F-PRAM-01 · Evaluación</span>
              </div>
              <PrintEvalTemplate />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECCIÓN 3: RECURSOS PEDAGÓGICOS EXTERNOS                  */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="space-y-4">
          <div>
            <h2 className="text-base font-bold tracking-tight text-slate-900">
              Recursos Pedagógicos Recomendados
            </h2>
            <p className="text-xs text-slate-500 font-normal">
              Plataformas verificadas de apoyo académico
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
                  <span className="rounded-md bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 text-[10px] font-medium">
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
