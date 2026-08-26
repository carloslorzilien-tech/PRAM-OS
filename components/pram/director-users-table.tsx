'use client'

import React, { useEffect, useState } from 'react'
import {
  Loader2,
  ShieldCheck,
  ShieldOff,
  UserCog,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { subscribeToAllUsers, updateUserRoleInFirestore, updateUserStatus } from '@/lib/firebase-service'
import { useFirebaseAuth } from '@/lib/firebase-auth'
import { Usuario } from '@/lib/db'

type Role = 'DIRECTOR' | 'AREA_DIRECTOR' | 'MENTOR' | 'STUDENT'
type Status = 'APPROVED' | 'PENDING' | 'REJECTED' | 'INACTIVE'

interface Notification {
  type: 'success' | 'error'
  text: string
}

export function DirectorUsersTable() {
  const { user } = useFirebaseAuth()
  const [allUsers, setAllUsers] = useState<Usuario[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [notification, setNotification] = useState<Notification | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<Record<string, Role>>({})

  const notify = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text })
    setTimeout(() => setNotification(null), 4000)
  }

  useEffect(() => {
    const unsubscribe = subscribeToAllUsers((users) => {
      setAllUsers(users.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '')))
      setLoadingUsers(false)
    })
    return () => unsubscribe()
  }, [])

  const handleRoleChange = async (targetUser: Usuario) => {
    const newRole = selectedRoles[targetUser.id] || (targetUser.rol as Role) || 'MENTOR'
    if (newRole === targetUser.rol) return

    // Guard: Director cannot demote themselves
    if (targetUser.id === user?.uid && newRole !== 'DIRECTOR') {
      notify('error', 'No puedes cambiar tu propio rol de Director.')
      return
    }

    setProcessingId(targetUser.id)
    const success = await updateUserRoleInFirestore(targetUser.id, newRole, (targetUser.status as Status) || 'APPROVED')
    setProcessingId(null)

    if (success) {
      notify('success', `Rol de ${targetUser.nombre} actualizado a ${newRole}.`)
      setSelectedRoles((prev) => { const n = { ...prev }; delete n[targetUser.id]; return n })
    } else {
      notify('error', `Error al actualizar el rol de ${targetUser.nombre}.`)
    }
  }

  const handleStatusToggle = async (targetUser: Usuario) => {
    // Guard: Director cannot deactivate themselves
    if (targetUser.id === user?.uid) {
      notify('error', 'No puedes desactivar tu propia cuenta.')
      return
    }

    const newStatus: Status = targetUser.status === 'APPROVED' ? 'INACTIVE' : 'APPROVED'
    setProcessingId(targetUser.id)
    const success = await updateUserStatus(targetUser.id, newStatus)
    setProcessingId(null)

    if (success) {
      notify('success', `${targetUser.nombre} marcado como ${newStatus === 'APPROVED' ? 'Activo' : 'Inactivo'}.`)
    } else {
      notify('error', `Error al cambiar estado de ${targetUser.nombre}.`)
    }
  }

  const handleApprove = async (targetUser: Usuario) => {
    const role = selectedRoles[targetUser.id] || 'MENTOR'
    setProcessingId(targetUser.id)
    const success = await updateUserRoleInFirestore(targetUser.id, role, 'APPROVED')
    setProcessingId(null)
    if (success) {
      notify('success', `${targetUser.nombre} aprobado con rol ${role}.`)
    } else {
      notify('error', `Error al aprobar a ${targetUser.nombre}.`)
    }
  }

  const handleReject = async (targetUser: Usuario) => {
    setProcessingId(targetUser.id)
    const success = await updateUserStatus(targetUser.id, 'REJECTED')
    setProcessingId(null)
    if (success) {
      notify('success', `Solicitud de ${targetUser.nombre} rechazada.`)
    } else {
      notify('error', `Error al rechazar a ${targetUser.nombre}.`)
    }
  }

  const pendingUsers = allUsers.filter((u) => u.status === 'PENDING')
  const activeUsers = allUsers.filter((u) => u.status !== 'PENDING')

  const statusBadge = (status: string) => {
    if (status === 'APPROVED') return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold">
        <CheckCircle2 className="size-3" /> Activo
      </span>
    )
    if (status === 'INACTIVE') return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold">
        <ShieldOff className="size-3" /> Inactivo
      </span>
    )
    if (status === 'PENDING') return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold">
        <Clock className="size-3" /> Pendiente
      </span>
    )
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 text-[10px] font-semibold">
        <XCircle className="size-3" /> Rechazado
      </span>
    )
  }

  if (loadingUsers) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
        <Loader2 className="size-5 animate-spin" />
        <span className="text-xs font-medium">Cargando usuarios en tiempo real...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className={`flex items-center gap-2 rounded-xl p-3 text-xs font-medium border ${
          notification.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {notification.type === 'success'
            ? <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            : <AlertCircle className="size-4 text-red-600 shrink-0" />
          }
          <span>{notification.text}</span>
        </div>
      )}

      {/* ── Solicitudes Pendientes ── */}
      {pendingUsers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Clock className="size-4 text-amber-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Solicitudes Pendientes de Aprobación ({pendingUsers.length})
            </h3>
          </div>
          <div className="space-y-2">
            {pendingUsers.map((u) => {
              const isProcessing = processingId === u.id
              return (
                <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-amber-50/60 border border-amber-200 rounded-xl">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{u.nombre}</p>
                    <p className="text-[11px] font-mono text-slate-500 truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={selectedRoles[u.id] || 'MENTOR'}
                      onChange={(e) => setSelectedRoles((prev) => ({ ...prev, [u.id]: e.target.value as Role }))}
                      className="h-8 text-xs font-semibold px-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
                    >
                      <option value="MENTOR">Mentor / Tutor</option>
                      <option value="AREA_DIRECTOR">Director de Área</option>
                      <option value="DIRECTOR">Director Académico</option>
                    </select>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleApprove(u)}
                      className="inline-flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                    >
                      {isProcessing ? <Loader2 className="size-3.5 animate-spin" /> : <ShieldCheck className="size-3.5" />}
                      <span>Aprobar</span>
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleReject(u)}
                      className="inline-flex items-center gap-1.5 bg-white text-rose-700 border border-rose-200 hover:bg-rose-50 disabled:opacity-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                    >
                      <XCircle className="size-3.5" />
                      <span>Rechazar</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Todos los Usuarios (tabla) ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <UserCog className="size-4 text-slate-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Todos los Usuarios ({activeUsers.length})
          </h3>
        </div>

        {activeUsers.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">No hay usuarios activos aún.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Email</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3 text-right">Horas</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {activeUsers.map((u) => {
                  const isProcessing = processingId === u.id
                  const isSelf = u.id === user?.uid
                  const currentRole = selectedRoles[u.id] || (u.rol as Role) || 'MENTOR'
                  const horasVal = (u as any).horasAcumuladas ?? (u as any).horas_acumuladas ?? 0

                  return (
                    <tr key={u.id} className={`hover:bg-slate-50/70 transition-colors ${isSelf ? 'bg-indigo-50/30' : ''}`}>
                      <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                        {u.nombre}
                        {isSelf && <span className="ml-1 text-[9px] text-indigo-500 font-bold uppercase">(Tú)</span>}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500 hidden sm:table-cell truncate max-w-[180px]">
                        {u.email}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={currentRole}
                          disabled={isSelf || isProcessing}
                          onChange={(e) => setSelectedRoles((prev) => ({ ...prev, [u.id]: e.target.value as Role }))}
                          className="h-8 text-xs font-semibold px-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <option value="MENTOR">Mentor</option>
                          <option value="AREA_DIRECTOR">Dir. Área</option>
                          <option value="DIRECTOR">Director</option>
                          <option value="STUDENT">Estudiante</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                        {Number(horasVal).toFixed(1)} h
                      </td>
                      <td className="px-4 py-3">
                        {statusBadge(u.status || 'PENDING')}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          {/* Apply Role Button */}
                          {!isSelf && currentRole !== (u.rol as Role) && (
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleRoleChange(u)}
                              className="inline-flex items-center gap-1 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
                            >
                              {isProcessing ? <Loader2 className="size-3 animate-spin" /> : <UserCog className="size-3" />}
                              <span>Aplicar</span>
                            </button>
                          )}

                          {/* Status Toggle */}
                          {!isSelf && (
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleStatusToggle(u)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer disabled:opacity-50 border ${
                                u.status === 'APPROVED'
                                  ? 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              }`}
                            >
                              {u.status === 'APPROVED'
                                ? <><ShieldOff className="size-3" /><span>Desactivar</span></>
                                : <><ShieldCheck className="size-3" /><span>Activar</span></>
                              }
                            </button>
                          )}
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
    </div>
  )
}
