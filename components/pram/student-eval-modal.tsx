'use client'

import React, { useState, useMemo } from 'react'
import {
  X,
  ClipboardList,
  Loader2,
  ChevronDown,
  ChevronUp,
  Microscope,
  AlertTriangle,
  FolderOpen,
  Info,
} from 'lucide-react'
import { addEvaluation, Evaluacion } from '@/lib/firebase-service'
import { showToast } from '@/components/pram/toast'
import { analyzeStudentPdpAlert, DRIVE_REPOSITORY_URL } from '@/lib/pdp-analytics'

// ── PDP Taxonomy ──────────────────────────────────────────────
type CausaRaiz = 'Procedimental' | 'Conceptual' | 'Atención' | 'Estratégico'
type MateriaKey = 'Matemáticas' | 'Lengua Española'

const PDP_SUBTYPES: Record<MateriaKey, Record<CausaRaiz, string[]>> = {
  'Matemáticas': {
    'Procedimental': ['Signo / Operación Inversa', 'Orden de Operaciones'],
    'Conceptual':    ['Confusión de Variable', 'Transferencia Incorrecta de Regla'],
    'Atención':      ['Falta de Validación del Resultado', 'Error Mecánico de Cálculo'],
    'Estratégico':   [],
  },
  'Lengua Española': {
    'Procedimental': ['Sujeto-objeto confuso'],
    'Conceptual':    ['Inversión de relación'],
    'Atención':      ['Salto de palabras'],
    'Estratégico':   ['Pérdida de matiz / contexto'],
  },
}

const CAUSA_RAIZ_OPTIONS: CausaRaiz[] = ['Procedimental', 'Conceptual', 'Atención', 'Estratégico']

const CAUSA_RAIZ_COLORS: Record<CausaRaiz, string> = {
  'Procedimental': 'border-blue-200 bg-blue-50 text-blue-700',
  'Conceptual':    'border-violet-200 bg-violet-50 text-violet-700',
  'Atención':      'border-amber-200 bg-amber-50 text-amber-700',
  'Estratégico':   'border-emerald-200 bg-emerald-50 text-emerald-700',
}


interface StudentEvalModalProps {
  studentId: string
  studentName: string
  studentSubject?: string
  existingEvals: Evaluacion[] // to check if EXAMEN_FINAL already exists
  onClose: () => void
  onSuccess: () => void
}

export function StudentEvalModal({
  studentId,
  studentName,
  studentSubject,
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
  const materia: MateriaKey = studentSubject === 'Lengua Española' ? 'Lengua Española' : 'Matemáticas'
  const pdpAlert = useMemo(() => analyzeStudentPdpAlert(existingEvals), [existingEvals])

  const [tipo, setTipo] = useState<'QUIZ' | 'EXAMEN_FINAL'>('QUIZ')
  const [calificacion, setCalificacion] = useState<string>('')
  const [tema, setTema] = useState<string>('')
  const [observacion, setObservacion] = useState<string>('')
  const [fecha, setFecha] = useState<string>(getTodayString)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // PDP state
  const [showPdp, setShowPdp]       = useState(false)
  const [causaRaiz, setCausaRaiz]   = useState<CausaRaiz | ''>('')
  const [subtipoError, setSubtipo]  = useState<string>('')
  const [tecnica, setTecnica]       = useState<string>('')
  const [ejercicios, setEjercicios] = useState<string>('')

  const handleCausaRaizChange = (c: CausaRaiz | '') => {
    setCausaRaiz(c)
    setSubtipo('')
  }
  const availableSubtipos: string[] = causaRaiz ? (PDP_SUBTYPES[materia][causaRaiz] ?? []) : []

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
      const payload: Omit<Evaluacion, 'id' | 'createdAt'> = {
        fecha,
        tipo,
        calificacion: califNum,
        tema: tema.trim(),
        observacion: observacion.trim(),
      }

      // Attach PDP fields only if the mentor opened and filled the section
      if (showPdp && causaRaiz) {
        payload.causaRaizPDP = causaRaiz
        if (subtipoError) payload.subtipoError = subtipoError
        if (tecnica.trim()) payload.tecnicaAplicada = tecnica.trim()
        if (ejercicios && Number.isFinite(Number(ejercicios))) {
          payload.ejerciciosResueltos = Number(ejercicios)
        }
      }

      const result = await addEvaluation(studentId, payload)

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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm px-4 py-6 overflow-y-auto">
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
              <span className="font-semibold text-slate-700">{studentName || 'Sin asignar'}</span>
              {' · '}
              <span className="text-slate-400">{materia}</span>
            </p>
          </div>
        </div>

        {/* Ficha de Alerta Preventiva / Diagnóstico Previo */}
        {pdpAlert.isStagnant && pdpAlert.prescription ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 space-y-2 text-xs text-rose-900 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded">
                <AlertTriangle className="size-3.5 text-rose-700 shrink-0" />
                Alerta PDP: Estudiante Estancado
              </span>
              <span className="text-[10px] text-rose-700 font-semibold">
                2 fallos consecutivos
              </span>
            </div>

            <p className="text-xs font-semibold leading-relaxed">
              El alumno presenta bloqueo recurrente en:{' '}
              <span className="font-bold underline decoration-rose-400">{pdpAlert.repeatedSubtype}</span>.
            </p>

            <div className="bg-white/95 rounded-lg p-2.5 border border-rose-200/80 space-y-1">
              <p className="text-[11px] font-semibold text-slate-800">
                Técnica Obligatoria: <span className="text-rose-900">{pdpAlert.prescription.tecnicaObligatoria}</span>
              </p>
              <p className="text-[10px] text-slate-600 leading-normal">
                {pdpAlert.prescription.instruccionMentor}
              </p>
            </div>

            <div className="pt-0.5 flex justify-end">
              <a
                href={pdpAlert.prescription.enlaceDrive}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-900 text-white hover:bg-rose-800 px-3 py-1.5 text-[11px] font-medium shadow-xs transition-all"
              >
                <FolderOpen className="size-3.5" />
                <span>Abrir Guía en Google Drive</span>
              </a>
            </div>
          </div>
        ) : pdpAlert.prescription ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-3 space-y-1.5 text-xs text-slate-700">
            <div className="flex items-center gap-1.5 text-slate-600 font-semibold text-[11px]">
              <Info className="size-3.5 text-slate-500 shrink-0" />
              <span>Diagnóstico PDP Previo:</span>
              <span className="text-slate-900 font-bold">{pdpAlert.lastDiagnoses[pdpAlert.lastDiagnoses.length - 1]?.subtipo}</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal">
              Recomendación: <strong className="text-slate-700">{pdpAlert.prescription.tecnicaObligatoria}</strong>.
            </p>
          </div>
        ) : null}

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

          {/* ── Diagnóstico PDP ───────────────────────────────── */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            {/* Toggle header */}
            <button
              type="button"
              onClick={() => setShowPdp((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Microscope className="size-4 text-slate-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Diagnóstico PDP
                </span>
                <span className="text-[10px] text-slate-400 font-normal">— opcional</span>
              </div>
              {showPdp
                ? <ChevronUp className="size-4 text-slate-400" />
                : <ChevronDown className="size-4 text-slate-400" />
              }
            </button>

            {showPdp && (
              <div className="px-4 pb-4 pt-3 space-y-3 bg-white">

                {/* Causa Raíz */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Causa Raíz del Error
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {CAUSA_RAIZ_OPTIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleCausaRaizChange(causaRaiz === c ? '' : c)}
                        className={`rounded-lg border px-3 py-2 text-xs font-semibold text-left transition-all ${
                          causaRaiz === c
                            ? CAUSA_RAIZ_COLORS[c]
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subtipo — solo si hay causa raíz con subtipos para esa materia */}
                {causaRaiz && availableSubtipos.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      Subtipo de Error{' '}
                      <span className="text-slate-400 font-normal normal-case">({materia})</span>
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {availableSubtipos.map((sub) => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => setSubtipo(subtipoError === sub ? '' : sub)}
                          className={`rounded-lg border px-3 py-2 text-xs font-medium text-left transition-all ${
                            subtipoError === sub
                              ? 'border-slate-900 bg-slate-900 text-white'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Técnica Aplicada */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Técnica Aplicada <span className="text-slate-400 font-normal lowercase">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Regla 90s, barras Singapur..."
                    value={tecnica}
                    onChange={(e) => setTecnica(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors"
                  />
                </div>

                {/* Ejercicios Resueltos */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Ejercicios Resueltos <span className="text-slate-400 font-normal lowercase">(opcional)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    placeholder="Ej: 5"
                    value={ejercicios}
                    onChange={(e) => setEjercicios(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors"
                  />
                </div>
              </div>
            )}
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
