'use client'

import React, { useState } from 'react'
import type { Role } from '@/lib/pram-data'
import { AppHeader } from './app-header'
import { Sidebar } from './sidebar'
import { BottomNav } from './bottom-nav'
import { RoleTabs } from './role-tabs'
import { SessionCard } from './session-card'
import { LevelBar } from './level-bar'
import { History } from './history'
import { MicroRoutes } from './micro-routes'
import { Checkpoint } from './checkpoint'
import { MentorView } from './mentor-view'
import { DirectorView } from './director-view'
import { RankingsView } from './rankings-view'
import { RegisterModal } from './register-modal'
import { AuthModal } from './auth-modal'
import { SplashScreen } from './splash-screen'
import type { SectionId } from './nav-items'
import { UserRole } from '@/types/pram'
import {
  Monitor,
  Smartphone,
  Tablet,
  Play,
  Wifi,
  WifiOff,
  UserCheck,
  Shield,
  GraduationCap,
  Sparkles,
} from 'lucide-react'
import { usePram } from '@/lib/pram-context'
import { cn } from '@/lib/utils'
import { LoadingSkeleton, ConnectionBanner } from './loading-skeleton'

const sectionTitles: Record<SectionId, string> = {
  inicio: 'Mi Panel',
  rankings: 'Tablas de Clasificación',
  checkpoint: 'Checkpoint de Dominio',
  'micro-rutas': 'Micro-Rutas de Aprendizaje',
  auditoria: 'Auditoría Ejecutiva MINERD',
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile'

export function Dashboard() {
  const {
    currentUser,
    setCurrentUserRole,
    isDemoMode,
    setIsDemoMode,
    isGuestMode,
    authModalState,
    closeAuthModal,
    requireAuth,
    isLoading,
    connectionError,
  } = usePram()

  const [showSplash, setShowSplash] = useState(true)
  const [section, setSection] = useState<SectionId>('inicio')
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop')
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)

  const isMobileOrTabletMode = deviceMode === 'mobile' || deviceMode === 'tablet'

  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  const handleOpenRegister = () => {
    requireAuth('registrar nuevos estudiantes o mentores', () => {
      setIsRegisterOpen(true)
    })
  }

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900 pb-20 md:pb-12 font-sans selection:bg-[#152642]/10 overflow-x-hidden">
      {/* Animación Splash Inicial */}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      {/* Barra de Control, Selector RBAC y Conmutador Modo Demo */}
      <div className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 sm:px-4 py-1.5 text-xs shadow-2xs">
        {/* Lado Izquierdo: Estado del Sistema y Toggle Modo Demo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0" />
            <span className="font-semibold text-slate-900">PRAM OS</span>
          </div>

          {/* Toggle Discreto: Modo Demo / Offline */}
          <button
            type="button"
            onClick={() => setIsDemoMode(!isDemoMode)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-colors border cursor-pointer',
              isDemoMode
                ? 'border-amber-200 bg-amber-50 text-amber-900'
                : 'border-slate-200 bg-slate-100 text-slate-600'
            )}
            title="Activa datos de prueba locales en mockData.js y persistencia en localStorage"
          >
            {isDemoMode ? <WifiOff className="size-3 text-amber-600" /> : <Wifi className="size-3 text-emerald-600" />}
            <span>Modo Demo: <strong className="uppercase">{isDemoMode ? 'ON' : 'OFF'}</strong></span>
          </button>
        </div>

        {/* Centro / Selector Rápido de Roles RBAC */}
        <div className="flex items-center gap-0.5 rounded-md bg-slate-100 p-0.5">
          <span className="text-[10px] font-medium text-slate-400 px-1 hidden md:inline">
            Rol RBAC:
          </span>
          <button
            type="button"
            onClick={() => setCurrentUserRole('guest')}
            className={cn(
              'rounded px-2 py-0.5 text-[10px] font-medium transition-colors cursor-pointer',
              currentUser.role === 'guest'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            Invitado
          </button>
          <button
            type="button"
            onClick={() => setCurrentUserRole('estudiante')}
            className={cn(
              'rounded px-2 py-0.5 text-[10px] font-medium transition-colors cursor-pointer',
              currentUser.role === 'estudiante'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            Estudiante
          </button>
          <button
            type="button"
            onClick={() => setCurrentUserRole('mentor_junior')}
            className={cn(
              'rounded px-2 py-0.5 text-[10px] font-medium transition-colors cursor-pointer',
              currentUser.role === 'mentor_junior'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            Mentor Junior
          </button>
          <button
            type="button"
            onClick={() => setCurrentUserRole('head_mentor')}
            className={cn(
              'rounded px-2 py-0.5 text-[10px] font-medium transition-colors cursor-pointer',
              currentUser.role === 'head_mentor'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            Head Mentor
          </button>
          <button
            type="button"
            onClick={() => setCurrentUserRole('director')}
            className={cn(
              'rounded px-2 py-0.5 text-[10px] font-medium transition-colors cursor-pointer',
              currentUser.role === 'director'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            Director
          </button>
        </div>

        {/* Lado Derecho: Selector de Dispositivo */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5 rounded-md bg-slate-100 p-0.5">
            <button
              type="button"
              onClick={() => setDeviceMode('desktop')}
              className={cn(
                'flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium transition-colors cursor-pointer',
                deviceMode === 'desktop'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              )}
            >
              <Monitor className="size-3" />
              <span className="hidden lg:inline">Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode('tablet')}
              className={cn(
                'flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium transition-colors cursor-pointer',
                deviceMode === 'tablet'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              )}
            >
              <Tablet className="size-3" />
              <span className="hidden lg:inline">Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode('mobile')}
              className={cn(
                'flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium transition-colors cursor-pointer',
                deviceMode === 'mobile'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              )}
            >
              <Smartphone className="size-3" />
              <span className="hidden lg:inline">Móvil</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowSplash(true)}
            className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Play className="size-3 text-slate-700" />
            <span className="hidden sm:inline">Splash</span>
          </button>
        </div>
      </div>

      {/* Contenedor Adaptable según el Dispositivo Seleccionado */}
      <div
        className={cn(
          'mx-auto transition-all duration-300 w-full',
          deviceMode === 'tablet' && 'my-6 max-w-[768px] rounded-2xl border-8 border-slate-900 bg-white shadow-xl overflow-hidden min-h-[900px]',
          deviceMode === 'mobile' && 'my-6 max-w-[420px] rounded-2xl border-8 border-slate-900 bg-white shadow-xl overflow-hidden min-h-[844px]'
        )}
      >
        <div className="min-h-dvh bg-slate-50">
          <AppHeader
            onOpenRegister={handleOpenRegister}
            onReplaySplash={() => setShowSplash(true)}
          />

          <div className="mx-auto flex max-w-5xl w-full">
            {deviceMode === 'desktop' && <Sidebar active={section} onSelect={setSection} />}

            <main className="min-w-0 flex-1 px-3.5 pb-24 pt-5 sm:px-6 md:px-8 md:pb-10 w-full overflow-x-hidden">
              {connectionError && <ConnectionBanner message={connectionError} />}
              {/* Título Dinámico según RBAC */}
              <div className="mb-5 flex flex-col items-center gap-1.5 text-center">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-medium text-slate-700 uppercase tracking-wider">
                  <Shield className="size-3 text-slate-500" />
                  <span>Perfil Activo: {currentUser.nombre} ({currentUser.role.replace('_', ' ')})</span>
                </div>

                <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl mt-1">
                  {section === 'rankings'
                    ? 'Tablas de Clasificación PRAM'
                    : section === 'auditoria'
                    ? 'Bandeja de Auditoría MINERD'
                    : currentUser.role === 'mentor_junior'
                    ? 'Panel del Mentor Junior'
                    : currentUser.role === 'head_mentor'
                    ? 'Panel del Head Mentor'
                    : currentUser.role === 'director'
                    ? 'Panel de Dirección & Auditoría'
                    : currentUser.role === 'estudiante'
                    ? 'Mi Refuerzo Personal'
                    : sectionTitles[section]}
                </h1>
                <p className="text-xs font-normal text-slate-500">
                  Periodo 2026-2 · Modelo Phygital Minerva Mirabal (MINERD)
                </p>
              </div>

              {/* Vistas RBAC Filtradas */}
              {isLoading ? (
                <LoadingSkeleton />
              ) : section === 'rankings' ? (
                <RankingsView />
              ) : section === 'auditoria' || currentUser.role === 'director' ? (
                <DirectorView />
              ) : currentUser.role === 'mentor_junior' || currentUser.role === 'head_mentor' ? (
                <MentorView />
              ) : currentUser.role === 'estudiante' ? (
                <StudentView section={section} forceSingleColumn={isMobileOrTabletMode} />
              ) : (
                /* Guest Mode / Vitrina Pública: Puede navegar entre rankings o ver vista general */
                <StudentView section={section} forceSingleColumn={isMobileOrTabletMode} />
              )}
            </main>
          </div>

          <BottomNav active={section} onSelect={setSection} />
        </div>
      </div>

      {/* Modal de Registro */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />

      {/* Modal de Autenticación / Auth Wall (Modo Vitrina) */}
      <AuthModal
        isOpen={authModalState.isOpen}
        onClose={closeAuthModal}
        actionLabel={authModalState.actionLabel}
      />
    </div>
  )
}

function StudentView({
  section,
  forceSingleColumn,
}: {
  section: SectionId
  forceSingleColumn?: boolean
}) {
  if (section === 'checkpoint') {
    return (
      <div className={cn('flex flex-col gap-5 max-w-2xl mx-auto w-full', !forceSingleColumn && 'md:grid md:grid-cols-2 md:max-w-none')}>
        <Checkpoint />
        <LevelBar />
      </div>
    )
  }

  if (section === 'micro-rutas') {
    return (
      <div className={cn('flex flex-col gap-5 max-w-2xl mx-auto w-full', !forceSingleColumn && 'md:grid md:grid-cols-2 md:max-w-none')}>
        <MicroRoutes />
        <Checkpoint />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-5 max-w-2xl mx-auto w-full',
        !forceSingleColumn && 'lg:grid lg:grid-cols-12 lg:gap-6 lg:max-w-none'
      )}
    >
      <div className={cn('flex flex-col gap-5 w-full', !forceSingleColumn && 'lg:col-span-7')}>
        <SessionCard />
        <LevelBar />
      </div>
      <div className={cn('flex flex-col gap-5 w-full', !forceSingleColumn && 'lg:col-span-5')}>
        <History />
        <MicroRoutes />
      </div>
    </div>
  )
}
