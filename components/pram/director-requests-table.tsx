'use client'

import React, { useState } from 'react'
import { approveFirebaseUser, rejectFirebaseUser, updateUserRoleInFirestore } from '@/lib/firebase-service'
import { Usuario } from '@/lib/db'
import { Check, X, ShieldCheck, AlertCircle, Loader2, UserCheck } from 'lucide-react'

export function DirectorRequestsTable({ initialUsers }: { initialUsers: Usuario[] }) {
  const [users, setUsers] = useState<Usuario[]>(initialUsers)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<Record<string, 'DIRECTOR' | 'AREA_DIRECTOR' | 'MENTOR' | 'STUDENT'>>({})
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleRoleChange = (userId: string, newRole: 'DIRECTOR' | 'AREA_DIRECTOR' | 'MENTOR' | 'STUDENT') => {
    setSelectedRoles((prev) => ({ ...prev, [userId]: newRole }))
  }

  const handleApproveWithRole = async (userItem: Usuario) => {
    setProcessingId(userItem.id)
    setMessage(null)
    const targetRole = selectedRoles[userItem.id] || userItem.rol || 'MENTOR'

    const success = await updateUserRoleInFirestore(userItem.id, targetRole, 'APPROVED')
    setProcessingId(null)

    if (success) {
      setUsers((prev) => prev.filter((u) => u.id !== userItem.id))
      setMessage({ type: 'success', text: `Usuario ${userItem.nombre} aprobado exitosamente con el rol de ${targetRole} en Firestore.` })
      setTimeout(() => setMessage(null), 4000)
    } else {
      setMessage({ type: 'error', text: 'Error al actualizar el rol y aprobar el usuario en Firestore.' })
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
                  <th className="px-5 py-3.5">Asignación de Rol (users/{'{uid}'})</th>
                  <th className="px-5 py-3.5">Detalle (Área / Grado)</th>
                  <th className="px-5 py-3.5 text-right">Acciones de Auditoría</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((userItem) => {
                  const isProcessing = processingId === userItem.id
                  const currentSelectedRole = selectedRoles[userItem.id] || userItem.rol || 'MENTOR'
                  const detalle = userItem.rol === 'MENTOR' ? `Área: ${userItem.area || 'Matemáticas'}` : `Grado: ${userItem.grado || '3ro de Secundaria'}`

                  return (
                    <tr key={userItem.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 font-semibold text-slate-900 whitespace-nowrap">
                        {userItem.nombre}
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                        {userItem.email}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <select
                          value={currentSelectedRole}
                          onChange={(e) => handleRoleChange(userItem.id, e.target.value as any)}
                          className="h-8 text-xs font-semibold px-2 py-1 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 cursor-pointer"
                        >
                          <option value="MENTOR">MENTOR (Tutor Académico)</option>
                          <option value="DIRECTOR">DIRECTOR (Dirección Académica)</option>
                          <option value="AREA_DIRECTOR">AREA_DIRECTOR (Director de Área)</option>
                          <option value="STUDENT">STUDENT (Estudiante)</option>
                        </select>
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-slate-800 whitespace-nowrap">
                        {detalle}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap space-x-2">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleApproveWithRole(userItem)}
                          className="inline-flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
                        >
                          {isProcessing ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <UserCheck className="size-3.5" />
                          )}
                          <span>{isProcessing ? 'Guardando...' : 'Asignar Rol y Aprobar'}</span>
                        </button>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleReject(userItem.id, userItem.nombre)}
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
