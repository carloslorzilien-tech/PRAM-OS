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
    <header className="sticky top-[41px] z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md md:px-6">
      {/* Lado Izquierdo: Logo PRAM + Encabezado Dinámico */}
      <div className="flex items-center gap-3">
        <Logo size="md" />

        <div className="hidden sm:block border-l border-slate-200 pl-3">
          {isGuestMode ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-tight text-slate-900">
                PRAM OS | Plataforma Pública
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.2 text-[10px] font-medium text-slate-600">
                <Lock className="size-3 text-slate-400" />
                Modo Lectura
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-tight text-slate-900">
                Hola, {currentUser?.nombre}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.2 text-[10px] font-medium text-slate-700 uppercase">
                {currentUser?.role?.replace('_', ' ')}
              </span>
            </div>
          )}
          <p className="text-[10px] font-normal text-slate-500">
            Liceo Minerva Mirabal · Periodo 2026-2
          </p>
        </div>
      </div>

      {/* Lado Derecho: Botones de Acción / Auth */}
      <div className="flex items-center gap-2">
        {/* Si es invitado: Botón INICIAR SESIÓN */}
        {isGuestMode ? (
          <button
            type="button"
            onClick={handleLoginClick}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-slate-900 px-3.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <LogIn className="size-3.5" />
            <span>Iniciar Sesión</span>
          </button>
        ) : (
          /* Si está autenticado: Botón Nuevo Registro + Avatar de Usuario */
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenRegister}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <UserPlus className="size-3.5 text-slate-600" />
              <span className="hidden xs:inline">+ Nuevo Registro</span>
            </button>

            {/* Menú Desplegable de Usuario */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 p-1 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="flex size-6 items-center justify-center rounded bg-slate-900 text-[10px] font-semibold text-white">
                  {currentUser?.nombre.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                </div>
                <ChevronDown className="size-3 text-slate-500" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-slate-200 bg-white p-2.5 shadow-lg z-50 animate-in fade-in">
                  <div className="border-b border-slate-100 pb-2 mb-2">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {currentUser?.nombre}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {currentUser?.email}
                    </p>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between rounded-md bg-slate-50 p-2 text-slate-700">
                      <span className="flex items-center gap-1.5 font-normal">
                        <KeyRound className="size-3.5 text-slate-600" />
                        PIN Nómada:
                      </span>
                      <strong className="font-mono font-bold text-slate-900">
                        {activeStudent?.pin || '1234'}
                      </strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false)
                        onReplaySplash()
                      }}
                      className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
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
                      className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left font-medium"
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
