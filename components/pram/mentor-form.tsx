'use client'

import React, { useState } from 'react'
import { PlusCircle, Clock, BookOpen, Users, Calendar, Check, AlertCircle, Loader2 } from 'lucide-react'
import { createFirebaseSession } from '@/lib/firebase-service'
import { useFirebaseAuth } from '@/lib/firebase-auth'
import { MateriaValida } from '@/lib/db'

export function MentorSessionForm({
  mentorId = 'm-1',
  onSessionAdded,
}: {
  mentorId?: string
  onSessionAdded?: () => void
}) {
  const { user, userProfile } = useFirebaseAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const materia = formData.get('materia') as MateriaValida
    const tema = (formData.get('tema') as string) || ''
    const duracionMinutos = Number(formData.get('duracion_minutos') || 45)
    const cantidadAlumnos = Number(formData.get('cantidad_alumnos') || 1)
    const fechaSesion = (formData.get('fecha_sesion') as string) || new Date().toISOString().split('T')[0]
    const notas = (formData.get('notas') as string) || ''

    if (!tema || !materia) {
      setError('Por favor complete todos los campos requeridos.')
      setIsSubmitting(false)
      return
    }

    try {
      const effectiveMentorId = user?.uid || mentorId || 'm-1'
      const mentorNombre = user?.displayName || userProfile?.nombre || 'Prof. Carlos Omar Lorzilien'

      await createFirebaseSession({
        mentor_id: effectiveMentorId,
        mentor_nombre: mentorNombre,
        materia,
        tema,
        duracion_minutos: duracionMinutos,
        cantidad_alumnos: cantidadAlumnos,
        fecha_sesion: fechaSesion,
        notas,
      })

      setSuccess(true)
      const form = e.target as HTMLFormElement
      form.reset()
      if (onSessionAdded) onSessionAdded()
      setTimeout(() => setSuccess(false), 4000)
    } catch (err) {
      console.error('[Firebase MentorForm Error]:', err)
      setError('Error al registrar la sesión en Firestore.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Mensajes de feedback */}
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-medium text-emerald-800">
          <Check className="size-4 text-emerald-600 shrink-0" />
          <span>¡Sesión registrada exitosamente en Firestore! Enviada a auditoría de dirección.</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-medium text-red-800">
          <AlertCircle className="size-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid de Campos (< 30 segundos) */}
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
            placeholder="Ej: Resolución de ecuaciones lineales y operaciones algebraicas"
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

      {/* Botón de Registro */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg px-6 py-2.5 text-xs font-medium shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Guardando en Firestore...</span>
            </>
          ) : (
            <>
              <PlusCircle className="size-4" />
              <span>Registrar Sesión en Firestore</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
