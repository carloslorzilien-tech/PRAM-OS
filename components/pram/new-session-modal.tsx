'use client'

import React, { useState } from 'react'
import {
  CalendarPlus,
  BookOpen,
  Clock,
  User,
  CheckCircle2,
  X,
} from 'lucide-react'
import { usePram } from '@/lib/pram-context'

interface NewSessionModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NewSessionModal({ isOpen, onClose }: NewSessionModalProps) {
  const { estudiantes, mentores, activeMentorId, setActiveMentorId, crearNuevaSesion } = usePram()

  const [mentorId, setMentorId] = useState(activeMentorId || mentores[0]?.id || 'm-1')
  const [estudianteId, setEstudianteId] = useState(estudiantes[0]?.id || 'e-1')
  const [tema, setTema] = useState('')
  const [materia, setMateria] = useState<'Matemáticas' | 'Lengua Española'>('Matemáticas')
  const [fecha, setFecha] = useState('15 ago 2026 · 4:00 PM')
  const [duracion, setDuracion] = useState(45)
  const [notas, setNotas] = useState(
    'Traer cuaderno de apuntes y ejercicios de la sesión anterior para práctica guiada.'
  )
  const [isSuccess, setIsSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tema.trim()) return

    setActiveMentorId(mentorId)

    await crearNuevaSesion({
      estudiante_id: estudianteId,
      mentor_id: mentorId,
      tema: tema.trim(),
      materia,
      fecha_programada: fecha,
      duracion_minutos: Number(duracion),
      notas,
    })

    setIsSuccess(true)
    setTimeout(() => {
      setIsSuccess(false)
      setTema('')
      onClose()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-2xl">
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="size-5" />
        </button>

        {/* Encabezado */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-[#152642] text-white shadow-sm">
            <CalendarPlus className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-black tracking-tight text-slate-900">
              Agendar Nueva Sesión
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Programa de Refuerzo Académico Minerva Mirabal
            </p>
          </div>
        </div>

        {/* Mensaje de éxito */}
        {isSuccess && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
            <span>¡Sesión agendada! Lista para validación dual con PIN del alumno.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mentor Responsable:
              </label>
              <select
                value={mentorId}
                onChange={(e) => setMentorId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#152642] focus:ring-2 focus:ring-[#152642]/10 outline-none cursor-pointer"
              >
                {mentores.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre} ({m.rango})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estudiante Asignado:
              </label>
              <select
                value={estudianteId}
                onChange={(e) => setEstudianteId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#152642] focus:ring-2 focus:ring-[#152642]/10 outline-none cursor-pointer"
              >
                {estudiantes.map((est) => (
                  <option key={est.id} value={est.id}>
                    {est.nombre} (Grado {est.grado} - PIN: {est.pin})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tema Pedagógico:
            </label>
            <input
              type="text"
              required
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              placeholder="Ej. Factorización de Trinomios Cuadráticos"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#152642] focus:ring-2 focus:ring-[#152642]/10 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Materia / Área:
              </label>
              <select
                value={materia}
                onChange={(e) => setMateria(e.target.value as 'Matemáticas' | 'Lengua Española')}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#152642] focus:ring-2 focus:ring-[#152642]/10 outline-none cursor-pointer"
              >
                <option value="Matemáticas">Matemáticas</option>
                <option value="Lengua Española">Lengua Española</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Duración:
              </label>
              <select
                value={duracion}
                onChange={(e) => setDuracion(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#152642] focus:ring-2 focus:ring-[#152642]/10 outline-none cursor-pointer"
              >
                <option value={30}>30 Minutos (0.5 h)</option>
                <option value={45}>45 Minutos (0.75 h)</option>
                <option value={60}>60 Minutos (1.0 h)</option>
                <option value={90}>90 Minutos (1.5 h)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Fecha y Hora:
            </label>
            <input
              type="text"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#152642] focus:ring-2 focus:ring-[#152642]/10 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Instrucciones para el Alumno:
            </label>
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#152642] focus:ring-2 focus:ring-[#152642]/10 outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full h-12 inline-flex items-center justify-center rounded-2xl bg-[#152642] text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#152642]/90 active:scale-[0.98] cursor-pointer"
          >
            CONFIRMAR Y AGENDAR SESIÓN →
          </button>
        </form>
      </div>
    </div>
  )
}
