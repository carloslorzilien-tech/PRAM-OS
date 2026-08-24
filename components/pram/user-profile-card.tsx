'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { User, ChevronDown, LayoutDashboard, CheckCircle2 } from 'lucide-react'

interface UserProfileCardProps {
  userRole?: 'DIRECTOR' | 'AREA_DIRECTOR' | 'MENTOR' | 'STUDENT'
  userStatus?: 'APPROVED' | 'PENDING' | 'REJECTED'
  userArea?: string | null
}

export function UserProfileBadge({ userRole = 'DIRECTOR', userStatus = 'APPROVED', userArea }: UserProfileCardProps) {
  const [showCard, setShowCard] = useState(false)

  const isDirector = userRole === 'DIRECTOR' || userRole === 'AREA_DIRECTOR'
  const roleLabel = isDirector
    ? 'Director Académico'
    : userArea
    ? `Mentor · ${userArea}`
    : 'Mentor de Matemáticas'

  const statusLabel = userStatus || 'APPROVED'
  const isApproved = statusLabel === 'APPROVED'
  const dashboardUrl = isDirector ? '/dashboard/director' : '/dashboard/mentor'
  const email = isDirector ? 'carlos.lorzilien@gmail.com' : 'carlosomarlorzilienservilien@gmail.com'
  const fullName = isDirector ? 'Carlos Lorzilien (Director)' : 'Prof. Carlos Omar Lorzilien'

  return (
    <div className="relative inline-flex items-center gap-2">
      {/* Badge con Rol en Navbar */}
      <button
        type="button"
        onClick={() => setShowCard(!showCard)}
        className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-slate-900 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs text-xs font-semibold"
      >
        <span
          className={`size-2 rounded-full ${
            isApproved ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
          }`}
        />
        <span className="truncate max-w-[140px] sm:max-w-[180px]">{roleLabel}</span>
        <ChevronDown className={`size-3.5 text-slate-500 transition-transform ${showCard ? 'rotate-180' : ''}`} />
      </button>

      {/* Avatar Estático */}
      <div className="flex size-8 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs">
        {fullName.charAt(0)}
      </div>

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
                <span className="inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="size-3 text-emerald-600" />
                  <span>APPROVED</span>
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <Link
                href={dashboardUrl}
                onClick={() => setShowCard(false)}
                className="flex w-full items-center justify-center gap-2 bg-[#152642] hover:bg-[#1e3a5f] text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-xs"
              >
                <LayoutDashboard className="size-3.5" />
                <span>Ir a Mi Panel de Control</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
