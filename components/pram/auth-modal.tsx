'use client'

import React, { useState } from 'react'
import { X, Lock, Sparkles, CheckCircle2, User, GraduationCap, ShieldCheck, BookOpen, Crown } from 'lucide-react'
import { usePram } from '@/lib/pram-context'
import { cn } from '@/lib/utils'
import { UserRole } from '@/types/pram'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  actionLabel?: string
}

export function AuthModal({ isOpen, onClose, actionLabel }: AuthModalProps) {
  const { signInWithGoogle, loginSimulado, currentUser, completeProfile } = usePram()
  const [step, setStep] = useState<'login' | 'onboarding'>('login')
  const [selectedRole, setSelectedRole] = useState<'estudiante' | 'mentor'>('estudiante')
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleGoogleAuth = async () => {
    setLoading(true)
    const result = await signInWithGoogle()
    setLoading(false)
    if (result.needsOnboarding) {
      setStep('onboarding')
    } else {
      onClose()
    }
  }

  const handleSimulatedAuth = (role: UserRole) => {
    loginSimulado(role)
    onClose()
  }

  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) return
    await completeProfile({ nombre: nombre.trim(), role: selectedRole })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-2xl"
        style={{ animation: 'modalIn 0.25s ease-out' }}
      >
        <style>{`@keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>

        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="size-5" />
        </button>

        {step === 'login' ? (
          <div>
            {/* Encabezado Premium */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[#152642] text-white shadow-sm">
                <Lock className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight text-slate-900">
                  Acceso Restringido
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {actionLabel
                    ? `Inicia sesión para ${actionLabel}.`
                    : 'Inicia sesión para interactuar con el sistema.'}
                </p>
              </div>
            </div>

            {/* Banner Modo Invitado */}
            <div className="mt-4 rounded-2xl bg-amber-50/70 p-4 border border-amber-200/80 text-xs text-amber-900">
              <p className="flex items-center gap-2 font-bold text-amber-950">
                <Sparkles className="size-4 text-amber-600 shrink-0" />
                Estás en Modo Vitrina (Público)
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-amber-800">
                Puedes explorar Rankings y el avance general. Para calificar, auditar o confirmar asistencia, selecciona tu rol:
              </p>
            </div>

            {/* Google OAuth Principal */}
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleAuth}
              className="mt-5 w-full flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 h-12 text-sm font-bold text-slate-800 shadow-sm hover:bg-slate-50 hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <svg className="size-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>{loading ? 'Conectando...' : 'Continuar con Google'}</span>
            </button>

            {/* Separador */}
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Acceso Rápido Demo</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Roles de Acceso Rápido */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSimulatedAuth('estudiante')}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-center hover:bg-white hover:border-[#152642]/30 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex size-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <BookOpen className="size-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-700">Estudiante</span>
                <span className="text-[10px] text-slate-400">Carlos Reyes</span>
              </button>

              <button
                type="button"
                onClick={() => handleSimulatedAuth('mentor_junior')}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-center hover:bg-white hover:border-[#152642]/30 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <User className="size-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-700">Mentor Junior</span>
                <span className="text-[10px] text-slate-400">Ing. Sofía Castillo</span>
              </button>

              <button
                type="button"
                onClick={() => handleSimulatedAuth('head_mentor')}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-center hover:bg-white hover:border-[#152642]/30 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex size-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                  <GraduationCap className="size-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-700">Head Mentor</span>
                <span className="text-[10px] text-slate-400">Prof. Altagracia Peña</span>
              </button>

              <button
                type="button"
                onClick={() => handleSimulatedAuth('director')}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-center hover:bg-white hover:border-[#152642]/30 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex size-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Crown className="size-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-700">Director</span>
                <span className="text-[10px] text-slate-400">Dra. Carmen Batlle</span>
              </button>
            </div>

            {/* Footer de Seguridad */}
            <div className="mt-5 rounded-xl bg-slate-50 border border-slate-100 p-3 flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Los datos de PRAM están protegidos con Row Level Security (RLS) y validación server-side. Tu sesión es segura.
              </p>
            </div>
          </div>
        ) : (
          /* Onboarding Step */
          <form onSubmit={handleCompleteOnboarding} className="space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
                <CheckCircle2 className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight text-slate-900">¡Bienvenido!</h3>
                <p className="text-xs text-slate-500 font-medium">Completa tu perfil para continuar</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tu nombre completo</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Prof. María García"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#152642] focus:ring-1 focus:ring-[#152642] outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Tu rol en PRAM</label>
              <div className="grid grid-cols-2 gap-2">
                {(['estudiante', 'mentor'] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-2xl border p-4 transition-all cursor-pointer',
                      selectedRole === role
                        ? 'border-[#152642] bg-[#152642]/5 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    {role === 'estudiante' ? (
                      <BookOpen className="size-5 text-blue-600" />
                    ) : (
                      <GraduationCap className="size-5 text-emerald-600" />
                    )}
                    <span className="text-xs font-bold text-slate-800 capitalize">{role === 'mentor' ? 'Prof. Mentor' : role}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!nombre.trim()}
              className="w-full h-12 rounded-2xl bg-[#152642] text-sm font-bold text-white shadow-md hover:bg-[#152642]/90 transition-all disabled:opacity-40 cursor-pointer"
            >
              Completar Registro
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
