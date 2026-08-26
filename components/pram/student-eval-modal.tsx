'use client'

import React, { useState } from 'react'
import { X, ClipboardList, Loader2 } from 'lucide-react'
import { addEvaluation, Evaluacion } from '@/lib/firebase-service'
import { showToast } from '@/components/pram/toast'

interface StudentEvalModalProps {
  studentId: string
  studentName: string
  existingEvals: Evaluacion[] // to check if EXAMEN_FINAL already exists
  onClose: () => void
  onSuccess: () => void
}

export function StudentEvalModal({
  studentId,
  studentName,
  existingEvals,
  onClose,
  onSuccess,
}: StudentEvalModalProps) {
  const getTodayString = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const hasFinalExam = Boolean(existingEvals?.some((e) => e.tipo === 'EXAMEN_FINAL'))

  const [tipo, setTipo] = useState<'QUIZ' | 'EXAMEN_FINAL'>('QUIZ')
  const [calificacion, setCalificacion] = useState<string>('')
  const [tema, setTema] = useState<string>('')
  const [observacion, setObservacion] = useState<string>('')
  const [fecha, setFecha] = useState<string>(getTodayString)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!studentId) {
      showToast('error', 'Error', 'Identificador de estudiante no válido.')
      return
    }

    const califNum = parseFloat(calificacion)
    if (!Number.isFinite(califNum) || califNum < 0 || califNum > 100) {
      showToast('error', 'Calificación inválida', 'La calificación debe ser un número entre 0 y 100.')
      return
    }

    if (!tema.trim()) {
      showToast('error', 'Campo requerido', 'El tema de la evaluación es obligatorio.')
      return
    }

    if (!fecha) {
      showToast('error', 'Campo requerido', 'La fecha de la evaluación es obligatoria.')
      return
    }

    if (tipo === 'EXAMEN_FINAL' && hasFinalExam) {
      showToast('error', 'Operación no permitida', 'El examen final ya ha sido registrado previamente.')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await addEvaluation(studentId, {
        fecha,
        tipo,
        calificacion: califNum,
        tema: tema.trim(),
        observacion: observacion.trim(),
      })

      if (result) {
        showToast(
          'success',
          'Evaluación registrada',
          `${tipo === 'EXAMEN_FINAL' ? 'Examen Final' : 'Quiz'} guardado correctamente.`
        )
        onSuccess()
        onClose()
      } else {
        showToast('error', 'Error al guardar', 'No se pudo registrar la evaluación en la base de datos.')
      }
    } catch (error) {
      console.error('[StudentEvalModal Error]:', error)
      showToast('error', 'Error inesperado', 'Ocurrió un error al procesar la evaluación.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md p-6 space-y-5 relative">
        {/* Botón de cerrar */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
          aria-label="Cerrar modal"
        >
          <X className="size-5" />
        </button>

        {/* Encabezado */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm shrink-0">
            <ClipboardList className="size-5" />
          </div>
          <div className="min-w-0 pr-6">
            <h3 className="text-base font-bold tracking-tight text-slate-900 truncate">
              Registrar Evaluación
            </h3>
            <p className="text-xs font-medium text-slate-500 truncate">
              Estudiante: <span className="font-semibold text-slate-700">{studentName || 'Sin asignar'}</span>
            </p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Evaluación */}
          <div>
            <label htmlFor="eval-tipo" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Tipo de Evaluación
            </label>
            <select
              id="eval-tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as 'QUIZ' | 'EXAMEN_FINAL')}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="QUIZ">Quiz / Evaluación de Seguimiento</option>
              <option value="EXAMEN_FINAL" disabled={hasFinalExam}>
                Examen Final {hasFinalExam ? '(Ya registrado)' : ''}
              </option>
            </select>
          </div>

          {/* Fecha y Calificación en 2 columnas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="eval-fecha" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Fecha
              </label>
              <input
                id="eval-fecha"
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors disabled:bg-slate-50"
              />
            </div>

            <div>
              <label htmlFor="eval-calificacion" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Calificación (0 - 100)
              </label>
              <input
                id="eval-calificacion"
                type="number"
                min={0}
                max={100}
                step={0.5}
                required
                placeholder="Ej: 85.5"
                value={calificacion}
                onChange={(e) => setCalificacion(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors disabled:bg-slate-50"
              />
            </div>
          </div>

          {/* Tema */}
          <div>
            <label htmlFor="eval-tema" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Tema Evaluado
            </label>
            <input
              id="eval-tema"
              type="text"
              required
              placeholder="Ej: Fracciones y decimales"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors disabled:bg-slate-50"
            />
          </div>

          {/* Observación */}
          <div>
            <label htmlFor="eval-observacion" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Observación <span className="text-slate-400 font-normal lowercase">(opcional)</span>
            </label>
            <input
              id="eval-observacion"
              type="text"
              placeholder="Domina suma, falla en división..."
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors disabled:bg-slate-50"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg px-4 py-2.5 text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                'Registrar Evaluación'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
