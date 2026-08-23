import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, Users, Clock, AlertTriangle } from 'lucide-react'
import { getPendingUsers, Usuario } from '@/lib/db'
import { DirectorRequestsTable } from '@/components/pram/director-requests-table'
import { getOrCreateCurrentUser } from '@/lib/auth-user'
import { UserProfileBadge } from '@/components/pram/user-profile-card'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Bandeja de Solicitudes · PRAM OS',
  description: 'Aprobación de registros de tutores y estudiantes por la Dirección Académica.',
}

export default async function DirectorSolicitudesPage() {
  let currentUser = null
  let pendingUsers: Usuario[] = []
  let isOfflineMode = false

  try {
    // 1. Verificación de Autenticación y Redirección por Rol/Estado
    currentUser = await getOrCreateCurrentUser()

    if (currentUser) {
      if (currentUser.status === 'PENDING') {
        redirect('/solicitud-pendiente')
      }
      if (currentUser.rol === 'MENTOR' || currentUser.rol === 'STUDENT') {
        redirect('/dashboard/mentor')
      }
    }

    // 2. Consulta blindada a Neon DB
    pendingUsers = await getPendingUsers()
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_REDIRECT') || error?.message?.includes('NEXT_REDIRECT')) {
      throw error
    }
    console.error('Error en Solicitudes Dashboard:', error)
    isOfflineMode = true
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Alerta de Modo Desconectado si aplica */}
      {isOfflineMode && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-xs px-4 py-2 flex items-center justify-center gap-2 font-medium">
          <AlertTriangle className="size-4 text-amber-600 shrink-0" />
          <span>Modo desconectado: mostrando vista base. Se reestablecerá automáticamente al reconectar.</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/director"
            className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Volver a Dirección"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              PRAM OS · Dirección Académica
            </span>
            <h1 className="text-sm font-semibold tracking-tight text-slate-900 leading-tight">
              Bandeja de Aprobación de Usuarios
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/director"
            className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
          >
            Panel de Auditoría
          </Link>
          <UserProfileBadge
            userRole={currentUser?.rol}
            userStatus={currentUser?.status}
            userArea={currentUser?.area}
          />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        {/* Banner informativo con estadísticas */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="size-5 text-slate-900" />
              <h2 className="text-base font-bold text-slate-900">
                Solicitudes de Acceso Pendientes
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-normal">
              Revisa los perfiles de nuevos tutores y estudiantes registrados con Google antes de habilitar su acceso al sistema.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3.5 py-1 text-xs font-bold text-amber-700">
              <Clock className="size-3.5" />
              <span>{(pendingUsers || []).length} pendientes</span>
            </span>
          </div>
        </div>

        {/* Tabla Interactiva de Solicitudes */}
        <DirectorRequestsTable initialUsers={pendingUsers || []} />
      </main>
    </div>
  )
}
