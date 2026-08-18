'use client'

import React, { useState } from 'react'
import {
  FileCheck2,
  Check,
  X,
  TrendingUp,
} from 'lucide-react'
import { usePram } from '@/lib/pram-context'
import { TipoExamen, VariantePrueba, NivelDominio } from '@/types/pram'
import { cn } from '@/lib/utils'

interface PhygitalModalProps {
  isOpen: boolean
  onClose: () => void
  defaultEstudianteId?: string
}

const PREGUNTAS_DEFAULT = [
  { id: '1', enunciado: '1. Despeje de incógnita lineal' },
  { id: '2', enunciado: '2. Operaciones con números negativos' },
  { id: '3', enunciado: '3. Simplificación de fracciones algebraicas' },
  { id: '4', enunciado: '4. Interpretación de problema verbal' },
  { id: '5', enunciado: '5. Verificación de conjunto solución' },
]

export function PhygitalModal({
  isOpen,
  onClose,
  defaultEstudianteId,
}: PhygitalModalProps) {
  const { estudiantes, registrarExamenPhygital, getEstudianteById } = usePram()

  const [estudianteId, setEstudianteId] = useState(
    defaultEstudianteId || estudiantes[0]?.id || ''
  )
  const [tipo, setTipo] = useState<TipoExamen>('Checkpoint')
  const [variante, setVariante] = useState<VariantePrueba>('A')
  const [respuestas, setRespuestas] = useState<Record<string, string>>({
    '1': 'A',
    '2': 'B',
    '3': 'C',
    '4': 'A',
    '5': 'D',
  })
  const [fotoUrl, setFotoUrl] = useState(
    'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&auto=format&fit=crop&q=60'
  )
  const [aiSummary, setAiSummary] = useState(
    'El estudiante domina el algoritmo de despeje básico, pero presenta confusión en la transposición de signos al cruzar la igualdad.'
  )
  const [isSaved, setIsSaved] = useState(false)

  if (!isOpen) return null

  const estudiante = getEstudianteById(estudianteId) || estudiantes[0]

  const totalCorrectas = Object.values(respuestas).filter(
    (val) => val === 'A' || val === 'C'
  ).length
  const nivelCalculado: NivelDominio = (
    Math.max(1, Math.min(5, totalCorrectas + 1))
  ) as NivelDominio

  const handleRespuestaChange = (preguntaId: string, opcion: string) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: opcion }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    await registrarExamenPhygital({
      estudiante_id: estudianteId || estudiante.id,
      tipo,
      variante,
      resultado_nivel: nivelCalculado,
      ai_analysis_summary: aiSummary,
      foto_url: fotoUrl,
      respuestas_detectadas: respuestas,
    })

    setIsSaved(true)
    setTimeout(() => {
      setIsSaved(false)
      onClose()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-2xl">
        {/* Botón Cerrar */}
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
            <FileCheck2 className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black tracking-tight text-slate-900">
                Evaluación Diagnóstica Phygital
              </h3>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-[#152642]">
                VAR {variante}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Captura física de examen impreso y digitalización pedagógica
            </p>
          </div>
        </div>

        {/* Mensaje de guardado */}
        {isSaved && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-bold text-emerald-800">
            <Check className="size-5 text-emerald-600 shrink-0" />
            <span>¡Examen guardado y nivel del estudiante actualizado exitosamente!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {/* Selector de Estudiante y Tipo de Prueba */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estudiante:
              </label>
              <select
                value={estudianteId}
                onChange={(e) => setEstudianteId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#152642] focus:ring-2 focus:ring-[#152642]/10 outline-none cursor-pointer"
              >
                {estudiantes.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre} (Nivel actual: {e.nivel_actual})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tipo de Examen:
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoExamen)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#152642] focus:ring-2 focus:ring-[#152642]/10 outline-none cursor-pointer"
              >
                <option value="Pre-Test">Pre-Test Diagnóstico</option>
                <option value="Checkpoint">Checkpoint Intermedio</option>
                <option value="Post-Test">Post-Test Cierre Institucional</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Variante:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['A', 'B', 'C'] as VariantePrueba[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVariante(v)}
                    className={cn(
                      'rounded-xl py-2 text-xs font-bold uppercase transition-all cursor-pointer shadow-2xs',
                      variante === v
                        ? 'bg-[#152642] text-white shadow-xs'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    )}
                  >
                    Var {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Calificación de Respuestas */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-bold text-slate-800 mb-2.5">
              Hoja de Respuestas (5 Reactivos):
            </p>
            <div className="space-y-2">
              {PREGUNTAS_DEFAULT.map((preg) => {
                const val = respuestas[preg.id] || 'A'
                return (
                  <div
                    key={preg.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs"
                  >
                    <span className="text-xs font-semibold text-slate-800">
                      {preg.enunciado}
                    </span>
                    <div className="flex gap-1">
                      {['A', 'B', 'C', 'D'].map((opc) => (
                        <button
                          key={opc}
                          type="button"
                          onClick={() => handleRespuestaChange(preg.id, opc)}
                          className={cn(
                            'size-8 rounded-lg text-xs font-bold transition-all cursor-pointer',
                            val === opc
                              ? 'bg-[#152642] text-white shadow-2xs'
                              : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          )}
                        >
                          {opc}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Resultado de Nivel Calculado */}
          <div className="flex items-center justify-between rounded-2xl border border-blue-200 bg-blue-50/70 p-4">
            <div>
              <span className="text-xs font-bold uppercase text-[#152642]">
                Nivel Resultante (Rúbrica 1-5):
              </span>
              <p className="text-xs text-slate-500 font-medium">
                Actualizará el récord del estudiante
              </p>
            </div>
            <span className="text-2xl font-black text-[#152642]">
              Nivel {nivelCalculado}
            </span>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Observaciones Pedagógicas:
            </label>
            <textarea
              rows={2}
              value={aiSummary}
              onChange={(e) => setAiSummary(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#152642] focus:ring-2 focus:ring-[#152642]/10 outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full h-12 inline-flex items-center justify-center rounded-2xl bg-[#152642] text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#152642]/90 active:scale-[0.98] cursor-pointer"
          >
            GUARDAR Y VINCULAR A EXPEDIENTE →
          </button>
        </form>
      </div>
    </div>
  )
}
