'use client'

import React, { useState } from 'react'
import { approveFirebaseSession, rejectFirebaseSession } from '@/lib/firebase-service'
import { Sesion } from '@/lib/db'
import { CheckCircle2, XCircle, Printer, Loader2 } from 'lucide-react'

export function DirectorAuditTable({ initialSessions }: { initialSessions: Sesion[] }) {
  const [sessions, setSessions] = useState(initialSessions)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleApprove = async (id: string) => {
    setProcessingId(id)
    const success = await approveFirebaseSession(id, 'Dirección del Liceo Minerva Mirabal')
    setProcessingId(null)
    if (success) {
      setSessions((prev) => prev.filter((s) => s.id !== id))
    }
  }

  const handleReject = async (id: string) => {
    setProcessingId(id)
    const success = await rejectFirebaseSession(id)
    setProcessingId(null)
    if (success) {
      setSessions((prev) => prev.filter((s) => s.id !== id))
    }
  }

  const handlePrintExpediente = () => {
    window.print()
  }

  return (
    <div className="space-y-4">
      {/* Barra de Acciones Globales */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Bandeja de Validación Institucional (Firestore)
          </span>
          <p className="text-xs text-slate-500 font-normal">
            {sessions.length} sesión(es) pendientes de firma y acreditación
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrintExpediente}
          className="inline-flex items-center gap-2 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg px-4 py-2 text-xs font-medium transition-all shadow-xs cursor-pointer"
        >
          <Printer className="size-4 text-slate-600" />
          <span>Imprimir Expediente Institucional</span>
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="py-12 text-center bg-slate-50/60 rounded-lg border border-slate-200/60">
          <CheckCircle2 className="size-8 text-emerald-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900">
            Bandeja al día
          </p>
          <p className="text-xs text-slate-500 font-normal mt-1">
            No hay sesiones pendientes de validación en este momento.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Mentor</th>
                <th className="px-4 py-3">Materia & Tema</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Duración</th>
                <th className="px-4 py-3">Alumnos</th>
                <th className="px-4 py-3 text-right">Acciones de Auditoría</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sessions.map((sesion) => {
                const isProcessing = processingId === sesion.id
                return (
                  <tr key={sesion.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                      {sesion.mentor_nombre || sesion.mentor_id}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{sesion.tema}</div>
                      <div className="text-[11px] text-slate-500">{sesion.materia}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                      {sesion.fecha_sesion}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-900 whitespace-nowrap">
                      {sesion.duracion_minutos} min ({(sesion.duracion_minutos / 60).toFixed(2)} h)
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                      {sesion.cantidad_alumnos} alumno(s)
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleApprove(sesion.id)}
                          className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg px-3 py-1.5 text-xs font-medium shadow-sm transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                        >
                          {isProcessing ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="size-3.5" />
                          )}
                          <span>{isProcessing ? 'Guardando...' : 'Aprobar y Bloquear'}</span>
                        </button>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleReject(sesion.id)}
                          className="bg-white text-slate-600 border border-slate-300 hover:bg-slate-50 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
                          title="Rechazar sesión"
                        >
                          <XCircle className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
