'use client'

import React from 'react'
import { Printer } from 'lucide-react'

export function PrintAttendanceTemplate() {
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
        <span>Imprimir / Guardar como PDF</span>
      </button>

      {/* Hoja de Asistencia Oficial — Visible únicamente al imprimir */}
      <div className="hidden print:block fixed inset-0 bg-white p-8 z-50 text-slate-900 font-sans">
        <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
          <h1 className="text-base font-bold uppercase tracking-wider">
            Ministerio de Educación de la República Dominicana (MINERD)
          </h1>
          <h2 className="text-sm font-semibold mt-1">
            Programa de Refuerzo Académico Minerva Mirabal (PRAM OS)
          </h2>
          <p className="text-xs text-slate-600">
            Control de Asistencia y Bitácora del Servicio Social Estudiantil (60 Horas)
          </p>
        </div>

        {/* Metadatos de la sesión */}
        <div className="grid grid-cols-2 gap-4 text-xs mb-6 border border-slate-300 p-4 rounded">
          <div>
            <p><strong>Nombre del Tutor:</strong> ___________________________________</p>
            <p className="mt-2"><strong>Materia / Asignatura:</strong> ____________________________</p>
          </div>
          <div>
            <p><strong>Fecha:</strong> ____ / ____ / 2026</p>
            <p className="mt-2"><strong>Hora Inicio / Fin:</strong> ____:____ a ____:____</p>
          </div>
          <div className="col-span-2">
            <p><strong>Tema Pedagógico Desarrollado:</strong> _________________________________________________</p>
          </div>
        </div>

        {/* Tabla de Firmas de Estudiantes */}
        <table className="w-full text-left text-xs border border-slate-300 mb-8">
          <thead className="bg-slate-100 border-b border-slate-300">
            <tr>
              <th className="p-2 border-r border-slate-300 w-8">#</th>
              <th className="p-2 border-r border-slate-300">Nombre del Estudiante</th>
              <th className="p-2 border-r border-slate-300 w-20">Grado/Sec</th>
              <th className="p-2 border-r border-slate-300 w-24">Nivel Rúbrica</th>
              <th className="p-2 w-32 text-center">Firma del Alumno</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <tr key={num} className="h-9">
                <td className="p-2 border-r border-slate-300 font-mono text-center">{num}</td>
                <td className="p-2 border-r border-slate-300"></td>
                <td className="p-2 border-r border-slate-300"></td>
                <td className="p-2 border-r border-slate-300"></td>
                <td className="p-2"></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Bloque de Firmas de Validación */}
        <div className="grid grid-cols-2 gap-8 pt-12 text-center text-xs">
          <div className="border-t border-slate-400 pt-2">
            <p className="font-semibold">Firma del Mentor / Tutor</p>
            <p className="text-slate-500 text-[10px]">Cédula / Matrícula</p>
          </div>
          <div className="border-t border-slate-400 pt-2">
            <p className="font-semibold">Dra. Carmen Batlle / Sello de Dirección</p>
            <p className="text-slate-500 text-[10px]">Supervisión Académica MINERD</p>
          </div>
        </div>
      </div>
    </div>
  )
}
