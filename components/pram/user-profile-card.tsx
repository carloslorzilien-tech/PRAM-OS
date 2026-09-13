'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { User, ChevronDown, LayoutDashboard, CheckCircle2, LogOut, Clock } from 'lucide-react'
import { useFirebaseAuth } from '@/lib/firebase-auth'

interface UserProfileCardProps {
  userRole?: 'DIRECTOR' | 'AREA_DIRECTOR' | 'MENTOR' | 'STUDENT'
  userStatus?: 'APPROVED' | 'PENDING' | 'REJECTED'
  userArea?: string | null
}

export function UserProfileBadge({
  userRole: propRole,
  userStatus: propStatus,
  userArea: propArea,
}: UserProfileCardProps) {
  const { user, userProfile, signOut } = useFirebaseAuth()
  const [showCard, setShowCard] = useState(false)

  const effectiveRole = userProfile?.rol || propRole || 'DIRECTOR'
  const effectiveStatus = userProfile?.status || propStatus || 'APPROVED'
  const effectiveArea = userProfile?.area || propArea

  const isDirector =
    effectiveRole === 'DIRECTOR' ||
    effectiveRole === 'AREA_DIRECTOR' ||
    user?.email?.toLowerCase() === 'carlos.lorzilien@gmail.com'

  const roleLabel = isDirector
    ? 'Director Académico'
    : effectiveArea
    ? `Mentor · ${effectiveArea}`
    : 'Mentor de Matemáticas'

  const isApproved = effectiveStatus === 'APPROVED'
  const dashboardUrl = isDirector ? '/dashboard/director' : '/dashboard/mentor'
  const email = user?.email || (isDirector ? 'carlos.lorzilien@gmail.com' : 'tutor@pram.edu.do')
  const fullName = user?.displayName || userProfile?.nombre || (isDirector ? 'Carlos Lorzilien (Director)' : 'Docente / Tutor PRAM')

  return (
    <div className="relative inline-flex items-center gap-1.5 sm:gap-2 shrink-0">
      {/* Badge con Rol en Navbar */}
      <button
        type="button"
        onClick={() => setShowCard(!showCard)}
        className="inline-flex items-center gap-1.5 sm:gap-2 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-slate-900 px-2.5 sm:px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs text-xs font-semibold shrink-0"
      >
        <span
          className={`size-2 rounded-full shrink-0 ${
            isApproved ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
          }`}
        />
        <span className="truncate max-w-[85px] xs:max-w-[120px] sm:max-w-[180px]">{roleLabel}</span>
        <ChevronDown className={`size-3.5 text-slate-500 shrink-0 transition-transform ${showCard ? 'rotate-180' : ''}`} />
      </button>

      {/* Avatar */}
      {user?.photoURL ? (
        <div className="size-8 rounded-xl overflow-hidden border border-slate-300 shadow-xs relative">
          <Image
            src={user.photoURL}
            alt={fullName}
            width={32}
            height={32}
            className="size-full object-cover"
          />
        </div>
      ) : (
        <div className="flex size-8 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs">
          {fullName.charAt(0)}
        </div>
      )}

      {/* Tarjeta Flotante Desplegable de Perfil */}
      {showCard && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowCard(false)}
          />
          <div className="absolute right-0 top-12 z-50 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-xl bg-[#152642] text-white">
                  <User className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {fullName}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono truncate">{email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-medium">Rol Asignado:</span>
                <span className="font-bold text-slate-900">{roleLabel}</span>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-medium">Estado de Cuenta:</span>
                <span
                  className={`inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded-full ${
                    isApproved
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {isApproved ? (
                    <>
                      <CheckCircle2 className="size-3 text-emerald-600" />
                      <span>APPROVED</span>
                    </>
                  ) : (
                    <>
                      <Clock className="size-3 text-amber-600" />
                      <span>PENDING</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <Link
                href={dashboardUrl}
                onClick={() => setShowCard(false)}
                className="flex w-full items-center justify-center gap-2 bg-[#152642] hover:bg-[#1e3a5f] text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-xs"
              >
                <LayoutDashboard className="size-3.5" />
                <span>Ir a Mi Panel de Control</span>
              </Link>

              {user && (
                <button
                  type="button"
                  onClick={async () => {
                    setShowCard(false)
                    await signOut()
                  }}
                  className="flex w-full items-center justify-center gap-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-medium py-2 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="size-3.5" />
                  <span>Cerrar Sesión</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
