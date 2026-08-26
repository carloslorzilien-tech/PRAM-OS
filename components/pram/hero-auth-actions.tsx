'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, LayoutDashboard, BookOpen, LogIn, Loader2 } from 'lucide-react'
import { useFirebaseAuth } from '@/lib/firebase-auth'

export function HeroAuthActions() {
  const { user, userProfile, loading, signInWithGoogle } = useFirebaseAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 pt-2">
        <div className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-100 px-5 text-xs font-medium text-slate-500">
          <Loader2 className="size-4 animate-spin text-slate-600" />
          <span>Verificando sesión...</span>
        </div>
      </div>
    )
  }

  // Estado: Usuario Autenticado
  if (user) {
    const isDirector =
      userProfile?.rol === 'DIRECTOR' ||
      userProfile?.rol === 'AREA_DIRECTOR' ||
      user.email === 'carlos.lorzilien@gmail.com'

    const dashboardUrl = isDirector ? '/dashboard/director' : '/dashboard/mentor'
    const roleLabel = isDirector ? 'Panel de Dirección' : 'Panel del Tutor'

    return (
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          href={dashboardUrl}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#152642] px-5 text-xs font-bold text-white shadow-sm hover:bg-[#1e3a5f] transition-all cursor-pointer"
        >
          <LayoutDashboard className="size-4 text-slate-200" />
          <span>Ir a Mi {roleLabel}</span>
          <ArrowRight className="size-3.5" />
        </Link>

        <Link
          href="/recursos"
          className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <BookOpen className="size-3.5 text-slate-400" />
          <span>Recursos</span>
        </Link>
      </div>
    )
  }

  // Estado: Usuario NO Autenticado
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
      <button
        type="button"
        onClick={() => signInWithGoogle()}
        className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#152642] px-5 text-xs font-bold text-white shadow-sm hover:bg-[#1e3a5f] transition-all cursor-pointer"
      >
        <LogIn className="size-4 text-slate-300" />
        <span>Acceder con Google</span>
        <ArrowRight className="size-3.5" />
      </button>

      <Link
        href="/recursos"
        className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
      >
        <BookOpen className="size-4 text-slate-500" />
        <span>Explorar Recursos</span>
      </Link>
    </div>
  )
}
