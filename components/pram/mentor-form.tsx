'use client'

import React, { useState } from 'react'
import { submitSessionAction } from '@/app/actions'
import { PlusCircle, Clock, BookOpen, Users, Calendar, Check, AlertCircle } from 'lucide-react'

export function MentorSessionForm({ mentorId = 'm-1' }: { mentorId?: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    formData.set('mentor_id', mentorId)

    const res = await submitSessionAction(formData)
    setIsSubmitting(false)

    if (res.success) {
      setSuccess(true)
      const form = e.target as HTMLFormElement
      form.reset()
      setTimeout(() => setSuccess(false), 4000)
    } else {
      setError(res.error || 'Error al guardar la sesión')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Mensajes de feedback */}
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-medium text-emerald-800">
          <Check className="size-4 text-emerald-600 shrink-0" />
          <span>¡Sesión registrada exitosamente! Enviada a auditoría de dirección.</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-medium text-red-800">
          <AlertCircle className="size-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid de 4 Campos Principales (< 30 segundos) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Campo 1: Materia */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Materia
          </label>
          <div className="relative">
            <select
              name="materia"
              required
              defaultValue="Matemáticas"
              className="w-full h-10 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all cursor-pointer"
            >
              <option value="Matemáticas">Matemáticas</option>
              <option value="Lengua Española">Lengua Española</option>
              <option value="Ciencias Naturales">Ciencias Naturales</option>
              <option value="Ciencias Sociales">Ciencias Sociales</option>
              <option value="Inglés">Inglés</option>
              <option value="Informática">Informática</option>
            </select>
          </div>
        </div>

        {/* Campo 2: Duración */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Duración de la Sesión
          </label>
          <div className="relative">
            <select
              name="duracion_minutos"
              required
              defaultValue="45"
              className="w-full h-10 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all cursor-pointer"
            >
              <option value="30">30 minutos (0.5 h)</option>
              <option value="45">45 minutos (0.75 h)</option>
              <option value="60">60 minutos (1.0 h)</option>
              <option value="90">90 minutos (1.5 h)</option>
              <option value="120">120 minutos (2.0 h)</option>
            </select>
          </div>
        </div>

        {/* Campo 3: Tema Tratado */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Tema Tratado
          </label>
          <input
            type="text"
            name="tema"
            required
            placeholder="Ej: Resolución de ecuaciones de 1er grado con fracciones"
            className="w-full h-10 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
          />
        </div>

        {/* Campo 4: Cantidad de Alumnos */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Alumnos Atendidos
          </label>
          <input
            type="number"
            name="cantidad_alumnos"
            min="1"
            max="40"
            required
            defaultValue="3"
            className="w-full h-10 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
          />
        </div>

        {/* Campo 5: Fecha de Sesión */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Fecha de la Sesión
          </label>
          <input
            type="date"
            name="fecha_sesion"
            required
            defaultValue={new Date().toISOString().split('T')[0]}
            className="w-full h-10 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
          />
        </div>
      </div>

      {/* Botón de Registro Rápido */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg px-6 py-2.5 text-xs font-medium shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          <PlusCircle className="size-4" />
          <span>{isSubmitting ? 'Guardando en Neon...' : 'Registrar Sesión de Tutoría'}</span>
        </button>
      </div>
    </form>
  )
}
