import React from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  BookOpen,
  FileCheck,
  ExternalLink,
  LogIn,
  ClipboardList,
  ShieldCheck,
  FolderTree,
  Smartphone,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { PrintEvalTemplate } from '@/components/pram/print-eval-template'

export const metadata = {
  title: 'Recursos, Guía y Formato F-PRAM-01 · PRAM OS',
  description: 'Guía visual para docentes, formato oficial F-PRAM-01, estructura de Drive y recursos pedagógicos · Liceo Minerva Mirabal.',
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
      description: 'Abre PRAM OS desde tu celular o laptop y haz clic en "Iniciar con Google". Tu cuenta queda registrada al instante.',
      detail: 'Acceso directo con tu correo de Gmail sin contraseñas adicionales.',
    },
    {
      step: '2',
      icon: ClipboardList,
      title: 'Asistencia y Registro Digital (<30s)',
      description: 'La asistencia es 100% digital: en el formulario de 4 campos registras la materia, duración, tema y cantidad de alumnos. Cero hojas de asistencia en papel.',
      detail: 'La sesión queda registrada de inmediato en la base de datos.',
    },
    {
      step: '3',
      icon: ShieldCheck,
      title: 'Auditoría y Certificación CUV',
      description: 'La Dirección de PRAM custodia las evaluaciones físicas y la Dirección del Liceo puede auditar en cualquier momento. Al aprobarse, se emite el CUV inmutable.',
      detail: 'El certificado CUV es permanente y verificable con código QR / web.',
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
              PRAM OS · Liceo Minerva Mirabal (Distrito 10-04)
            </span>
            <h1 className="text-sm font-semibold tracking-tight text-slate-900 leading-tight">
              Recursos, Guía y Formato Oficial
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
              Guía Rápida: Cómo Funciona PRAM OS
            </h2>
            <p className="text-xs text-slate-500 font-normal">
              Flujo unificado: registro ágil en la nube, respaldo físico de exámenes y certificación oficial CUV.
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
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-slate-900 text-white font-mono text-lg font-bold shrink-0">
                      {item.step}
                    </span>
                    <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 shrink-0">
                      <Icon className="size-4" />
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>

                  <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-100 pt-2">
                    {item.detail}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Banner de Claridad: Asistencia Digital vs Exámenes Físicos */}
          <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs text-emerald-950 leading-relaxed space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              <span>Cero Papeleo en Asistencia · Máximo Rigor en Evaluaciones</span>
            </div>
            <p className="text-emerald-800">
              <strong>La asistencia y las horas son 100% digitales:</strong> el tutor las registra en 30 segundos desde su teléfono. 
              <strong> El único papel físico que existe</strong> es la hoja de examen F-PRAM-01 donde el estudiante resuelve los problemas a mano para demostrar su aprendizaje real.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECCIÓN 2: ÚNICA PLANTILLA OFICIAL F-PRAM-01 (EVALUACIÓN)  */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight text-slate-900">
                Formato Oficial F-PRAM-01 (Hoja de Evaluación)
              </h2>
              <span className="rounded-md bg-slate-900 text-white px-2 py-0.5 text-[10px] font-mono font-semibold">
                Única Plantilla Física
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal">
              Formato impreso para la resolución manual de Pre-Test, Quizzes y Post-Test. Corrige en papel, toma una foto para el Drive y asienta la nota en PRAM OS.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileCheck className="size-4.5 text-slate-900" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    Registro de Evaluación y Auditoría de Impacto (F-PRAM-01)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 max-w-xl">
                  Incluye encabezado del Liceo Minerva Mirabal (Distrito 10-04), casillas de materia y tipo de prueba, área de desarrollo rayada, bloque de puntaje /100 y firmas de custodia y supervisión.
                </p>
              </div>

              <PrintEvalTemplate />
            </div>

            {/* Ficha técnica compacta de la plantilla */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block font-mono">Uso</span>
                <span className="font-semibold text-slate-800">Pre-Test / Quiz / Post-Test</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block font-mono">Calificación</span>
                <span className="font-semibold text-slate-800">0 a 100 Puntos</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block font-mono">Custodia</span>
                <span className="font-semibold text-slate-800">Dirección de PRAM</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block font-mono">Auditoría</span>
                <span className="font-semibold text-slate-800">Dirección del Liceo</span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECCIÓN 3: ESTRUCTURA DE RESPALDO EN GOOGLE DRIVE           */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FolderTree className="size-4.5 text-slate-900" />
              <h2 className="text-base font-bold tracking-tight text-slate-900">
                Repositorio Digital de Evidencias · Google Drive
              </h2>
              <span className="rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold">
                Repositorio Oficial
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal">
              Acceso institucional en la nube para la carga de respaldos fotográficos y auditoría directa de las evaluaciones físicas F-PRAM-01.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-5">
            {/* Banner de Acceso Oficial al Enlace de Drive */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-900">
                    Carpeta Oficial PRAM OS (Distrito 10-04)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 max-w-md leading-relaxed">
                  Repositorio activo en Google Drive para consultar o auditar las pruebas físicas corregidas de los estudiantes del programa.
                </p>
              </div>

              <a
                href="https://drive.google.com/drive/folders/1rcQrX6BB6LYM647_3VZ71akE0lFFf6IB?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg px-4 py-2.5 text-xs font-semibold shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0 group"
              >
                <span>Abrir Repositorio Oficial en Drive</span>
                <ExternalLink className="size-3.5 text-slate-300 group-hover:text-white transition-colors" />
              </a>
            </div>

            {/* Matriz de Gobernanza y Permisos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Carga y Edición de Evidencias</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                    Mentores & PRAM
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Reservado a la <strong>Dirección de PRAM</strong> y tutores acreditados para subir la fotografía del examen corregido inmediatamente tras la sesión.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Auditoría y Supervisión</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                    Dirección Liceo / MINERD
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Acceso de consulta para la <strong>Dirección del Liceo Minerva Mirabal</strong> y supervisores del Distrito 10-04 para verificar la autenticidad de cualquier nota.
                </p>
              </div>
            </div>

            {/* El Protocolo de los 5 Segundos */}
            <div className="flex items-start gap-3 p-4 bg-slate-50/70 rounded-lg border border-slate-200/80">
              <Smartphone className="size-5 text-slate-900 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-slate-700">
                <p className="font-semibold text-slate-900">Protocolo de Cero Fricción (5 Segundos)</p>
                <p className="text-slate-600 leading-relaxed">
                  Al corregir la prueba física F-PRAM-01 en papel, el tutor toma una fotografía clara del desarrollo y la sube en 5 segundos a la carpeta del estudiante en el Drive. Luego archiva la hoja original en la carpeta física y asienta la nota en la app.
                </p>
              </div>
            </div>

            {/* Árbol Visual de Estructura de Carpetas */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 block">
                Estructura de Organización por Estudiante:
              </span>
              <div className="p-4 bg-slate-900 rounded-lg text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 shadow-inner">
                <div className="text-emerald-400 font-bold mb-1.5">📁 PRAM OS - Evidencias de Evaluacion (Distrito 10-04)/</div>
                <div className="text-slate-400">├── 📄 PROTOCOLO_Y_ORGANIZACION_DRIVE.txt</div>
                <div className="text-slate-400">└── 📁 Cohorte_Piloto_12_Estudiantes/</div>
                <div className="text-slate-300 ml-4">├── 📁 01_Estudiante_3roA/  → PreTest.jpg, Quiz_01.jpg, PostTest.jpg</div>
                <div className="text-slate-300 ml-4">├── 📁 02_Estudiante_3roA/</div>
                <div className="text-slate-300 ml-4">├── 📁 03_Estudiante_3roB/</div>
                <div className="text-slate-300 ml-4">├── 📁 04_Estudiante_3roB/</div>
                <div className="text-slate-300 ml-4">├── 📁 05_Estudiante_4toA/</div>
                <div className="text-slate-300 ml-4">├── 📁 06_Estudiante_4toA/</div>
                <div className="text-slate-300 ml-4">├── 📁 07_Estudiante_4toB/</div>
                <div className="text-slate-300 ml-4">└── 📁 ... (12 Expedientes Digitales)</div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Los respaldos fotográficos alojados en este repositorio de Google Drive constituyen el <strong>Audit Trail secundario</strong> que valida de forma transparente cada $\Delta$ de aprendizaje y cada certificado CUV emitido por la plataforma.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECCIÓN 4: RECURSOS PEDAGÓGICOS EXTERNOS                  */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="space-y-4">
          <div>
            <h2 className="text-base font-bold tracking-tight text-slate-900">
              Recursos Pedagógicos Recomendados
            </h2>
            <p className="text-xs text-slate-500 font-normal">
              Plataformas oficiales de apoyo y práctica académica
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
