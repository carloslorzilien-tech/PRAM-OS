'use client'

import React from 'react'
import { Printer } from 'lucide-react'

export function PrintEvalTemplate() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div>
      <button
        type="button"
        onClick={handlePrint}
        className="inline-flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg px-4 py-2 text-xs font-medium shadow-sm transition-all cursor-pointer whitespace-nowrap"
      >
        <Printer className="size-4" />
        <span>Imprimir F-PRAM-01</span>
      </button>

      {/* Formato F-PRAM-01 de Evaluación — Visible únicamente al imprimir */}
      <div className="hidden print:block fixed inset-0 bg-white p-8 z-50 text-slate-900 font-sans">
        {/* Encabezado Institucional */}
        <div className="text-center border-b-2 border-slate-900 pb-3 mb-5">
          <h1 className="text-sm font-bold uppercase tracking-wider">
            Liceo Minerva Mirabal — Distrito Educativo 10-04
          </h1>
          <h2 className="text-xs font-semibold mt-1">
            Programa de Refuerzo Académico Minerva (PRAM)
          </h2>
          <p className="text-[11px] text-slate-600 mt-0.5">
            Registro de Evaluación y Auditoría de Impacto (F-PRAM-01)
          </p>
        </div>

        {/* Bloque de Datos del Estudiante y Evaluador */}
        <div className="border border-slate-400 text-xs mb-5">
          {/* Fila 1: Estudiante + Grado + Fecha */}
          <div className="grid grid-cols-12 border-b border-slate-300">
            <div className="col-span-6 p-2.5 border-r border-slate-300">
              <span className="font-semibold">Estudiante:</span>{' '}
              <span className="text-slate-500">___________________________________________</span>
            </div>
            <div className="col-span-3 p-2.5 border-r border-slate-300">
              <span className="font-semibold">Grado/Sec:</span>{' '}
              <span className="text-slate-500">____________</span>
            </div>
            <div className="col-span-3 p-2.5">
              <span className="font-semibold">Fecha:</span>{' '}
              <span className="text-slate-500">____/____/2026</span>
            </div>
          </div>

          {/* Fila 2: Mentor + Materia */}
          <div className="grid grid-cols-12 border-b border-slate-300">
            <div className="col-span-7 p-2.5 border-r border-slate-300">
              <span className="font-semibold">Mentor Evaluador:</span>{' '}
              <span className="text-slate-500">_____________________________________</span>
            </div>
            <div className="col-span-5 p-2.5">
              <span className="font-semibold">Materia:</span>{' '}
              <span className="ml-3">☐ Matemáticas{'    '}☐ Lengua Española</span>
            </div>
          </div>

          {/* Fila 3: Tipo de Evaluación */}
          <div className="p-2.5">
            <span className="font-semibold">Tipo:</span>{' '}
            <span className="ml-3">☐ Pre-Test (Diagnóstico Inicial)</span>
            <span className="ml-5">☐ Quiz de Seguimiento</span>
            <span className="ml-5">☐ Post-Test (Evaluación Final)</span>
          </div>
        </div>

        {/* Área de Desarrollo del Examen */}
        <div className="border border-slate-400 mb-5">
          <div className="bg-slate-100 px-3 py-2 border-b border-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Desarrollo del Examen (Área de Trabajo del Estudiante)
            </span>
          </div>
          {/* Líneas de escritura — hoja lisa */}
          <div className="p-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="border-b border-slate-300 h-7" />
            ))}
          </div>
        </div>

        {/* Bloque de Puntaje */}
        <div className="border-2 border-slate-900 p-4 mb-6 flex items-center justify-between">
          <div className="text-sm font-bold uppercase tracking-wide">
            Puntaje Obtenido:
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight">
            ________ / 100 pts
          </div>
        </div>

        {/* Bloque de Firmas */}
        <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
          <div className="border-t border-slate-400 pt-2">
            <p className="font-semibold">Dirección de PRAM / Mentor Evaluador</p>
            <p className="text-slate-500 text-[10px]">Custodia y Aplicación Pedagógica</p>
          </div>
          <div className="border-t border-slate-400 pt-2">
            <p className="font-semibold">Dirección del Liceo Minerva Mirabal</p>
            <p className="text-slate-500 text-[10px]">Supervisión Institucional & Auditoría</p>
          </div>
        </div>

        {/* Pie de página */}
        <div className="mt-6 text-center text-[9px] text-slate-400">
          PRAM OS · Liceo Minerva Mirabal · Distrito 10-04 · Formato F-PRAM-01 · Este documento es soporte físico de evidencia del registro digital.
        </div>
      </div>
    </div>
  )
}
