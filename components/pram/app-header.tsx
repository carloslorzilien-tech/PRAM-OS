'use client'

import React, { useState } from 'react'
import {
  UserCheck,
  ChevronDown,
  UserPlus,
  RefreshCw,
  LogOut,
  Lock,
  LogIn,
  KeyRound,
  Sparkles,
} from 'lucide-react'
import { usePram } from '@/lib/pram-context'
import { Logo } from './logo'
import { cn } from '@/lib/utils'

interface AppHeaderProps {
  onOpenRegister: () => void
  onReplaySplash: () => void
  onOpenAuth?: () => void
}

export function AppHeader({ onOpenRegister, onReplaySplash }: AppHeaderProps) {
  const {
    currentUser,
    isGuestMode,
    signOut,
    requireAuth,
    estudiantes,
    mentores,
  } = usePram()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const activeStudent = estudiantes[0]
  const activeMentor = mentores[0]

  const handleLoginClick = () => {
    requireAuth('iniciar sesión', () => {})
  }

  return (
    <header className="sticky top-[41px] z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md md:px-6">
      {/* Lado Izquierdo: Logo PRAM + Encabezado Dinámico */}
      <div className="flex items-center gap-3">
        <Logo size="md" />

        <div className="hidden sm:block border-l border-slate-200 pl-3">
          {isGuestMode ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-tight text-slate-900">
                PRAM OS | Plataforma Pública
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-300 px-2 py-0.2 text-[10px] font-bold text-slate-700">
                <Lock className="size-3 text-slate-500" />
                Modo Lectura 🔒
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-tight text-slate-900">
                Hola, {currentUser?.nombre}
              </span>
              <span className="rounded-full bg-[#152642]/10 px-2 py-0.2 text-[10px] font-bold text-[#152642] uppercase">
                {currentUser?.role?.replace('_', ' ')}
              </span>
            </div>
          )}
          <p className="text-[10px] font-medium text-slate-400">
            Liceo Minerva Mirabal · Periodo 2026-2
          </p>
        </div>
      </div>

      {/* Lado Derecho: Botones de Acción / Auth */}
      <div className="flex items-center gap-2.5">
        {/* Si es invitado: Botón INICIAR SESIÓN */}
        {isGuestMode ? (
          <button
            type="button"
            onClick={handleLoginClick}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#152642] px-4 text-xs font-bold text-white shadow-sm hover:bg-[#152642]/90 active:scale-[0.98] transition-all cursor-pointer"
          >
            <LogIn className="size-3.5" />
            <span>INICIAR SESIÓN</span>
          </button>
        ) : (
          /* Si está autenticado: Botón Nuevo Registro + Avatar de Usuario */
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenRegister}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer"
            >
              <UserPlus className="size-3.5 text-[#152642]" />
              <span className="hidden xs:inline">+ NUEVO REGISTRO</span>
            </button>

            {/* Menú Desplegable de Usuario */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="flex size-7 items-center justify-center rounded-lg bg-[#152642] text-xs font-bold text-white">
                  {currentUser?.nombre.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                </div>
                <ChevronDown className="size-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl z-50 animate-in fade-in">
                  <div className="border-b border-slate-100 pb-2 mb-2">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {currentUser?.nombre}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {currentUser?.email}
                    </p>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2 text-slate-700">
                      <span className="flex items-center gap-1.5 font-medium">
                        <KeyRound className="size-3.5 text-[#152642]" />
                        PIN Nómada:
                      </span>
                      <strong className="font-mono font-bold text-[#152642]">
                        {activeStudent?.pin || '1234'}
                      </strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false)
                        onReplaySplash()
                      }}
                      className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                    >
                      <RefreshCw className="size-3.5 text-slate-400" />
                      <span>Ver Animación Splash</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false)
                        signOut()
                      }}
                      className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left font-bold"
                    >
                      <LogOut className="size-3.5" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
