'use client'

import React, { useState } from 'react'
import { approveFirebaseUser, rejectFirebaseUser } from '@/lib/firebase-service'
import { Usuario } from '@/lib/db'
import { Check, X, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react'

export function DirectorRequestsTable({ initialUsers }: { initialUsers: Usuario[] }) {
  const [users, setUsers] = useState<Usuario[]>(initialUsers)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleApprove = async (userId: string, userName: string) => {
    setProcessingId(userId)
    setMessage(null)
    const success = await approveFirebaseUser(userId)
    setProcessingId(null)

    if (success) {
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      setMessage({ type: 'success', text: `Solicitud de ${userName} aprobada con éxito en Firestore.` })
      setTimeout(() => setMessage(null), 4000)
    } else {
      setMessage({ type: 'error', text: 'Error al aprobar usuario en Firestore.' })
    }
  }

  const handleReject = async (userId: string, userName: string) => {
    setProcessingId(userId)
    setMessage(null)
    const success = await rejectFirebaseUser(userId)
    setProcessingId(null)

    if (success) {
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      setMessage({ type: 'success', text: `Solicitud de ${userName} rechazada.` })
      setTimeout(() => setMessage(null), 4000)
    } else {
      setMessage({ type: 'error', text: 'Error al rechazar usuario.' })
    }
  }

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`flex items-center gap-2 rounded-xl p-3 text-xs font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="size-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="size-4 text-red-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {users.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mx-auto border border-emerald-200">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Bandeja de Solicitudes al Día</h3>
            <p className="text-xs text-slate-500 font-normal mt-1">
              No hay solicitudes pendientes de aprobación en este momento.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Usuario / Solicitante</th>
                  <th className="px-5 py-3.5">Correo Electrónico</th>
                  <th className="px-5 py-3.5">Rol Solicitado</th>
                  <th className="px-5 py-3.5">Detalle (Área / Grado)</th>
                  <th className="px-5 py-3.5 text-right">Acciones de Auditoría</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((user) => {
                  const isProcessing = processingId === user.id
                  const rolLabel = user.rol === 'MENTOR' ? 'Tutor / Mentor' : 'Estudiante'
                  const detalle = user.rol === 'MENTOR' ? `Área: ${user.area || 'Matemáticas'}` : `Grado: ${user.grado || '3ro de Secundaria'}`

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 font-semibold text-slate-900 whitespace-nowrap">
                        {user.nombre}
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            user.rol === 'MENTOR'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}
                        >
                          {rolLabel}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-slate-800 whitespace-nowrap">
                        {detalle}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap space-x-2">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleApprove(user.id, user.nombre)}
                          className="inline-flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
                        >
                          {isProcessing ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Check className="size-3.5" />
                          )}
                          <span>{isProcessing ? 'Procesando...' : 'Aprobar'}</span>
                        </button>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleReject(user.id, user.nombre)}
                          className="inline-flex items-center gap-1.5 bg-white text-rose-700 border border-rose-200 hover:bg-rose-50 disabled:opacity-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                        >
                          <X className="size-3.5" />
                          <span>Rechazar</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
