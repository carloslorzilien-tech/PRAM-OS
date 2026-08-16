'use client'

import React, { useState } from 'react'
import { CalendarClock, Check, ShieldCheck, User, AlertCircle, BookOpen, Sparkles, Send, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePram } from '@/lib/pram-context'

export function SessionCard() {
  const {
    sesionesVisibles,
    getMentorById,
    getEstudianteById,
    confirmarAsistenciaNomada,
    confirmarAsistenciaEstudiante,
    solicitarMicroRuta,
    requireAuth,
    currentUser,
  } = usePram()
  
  const currentSession = currentUser?.role === 'estudiante' && currentUser.estudianteData
    ? sesionesVisibles.find((s) => s.estudiante_id === currentUser.estudianteData!.id) || sesionesVisibles[0]
    : sesionesVisibles[0]
  const mentor = currentSession ? getMentorById(currentSession.mentor_id) : null
  const estudiante = currentSession ? getEstudianteById(currentSession.estudiante_id) : null

  const [pin, setPin] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [enteringPin, setEnteringPin] = useState(false)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [temaRefuerzo, setTemaRefuerzo] = useState('')
  const [requestSuccess, setRequestSuccess] = useState(false)

  if (!currentSession) return null

  const isConfirmed = currentSession.confirmacion_estudiante

  function handleConfirmPin() {
    requireAuth('validar asistencia a la sesión', () => {
      if (!enteringPin) {
        setEnteringPin(true)
        return
      }
      const res = confirmarAsistenciaNomada(currentSession.id, pin)
      if (res.success) {
        setErrorMsg(null)
        setEnteringPin(false)
      } else {
        setErrorMsg(res.message)
      }
    })
  }

  async function handleDirectConfirm() {
    requireAuth('confirmar asistencia a la sesión', async () => {
      await confirmarAsistenciaEstudiante(currentSession.id)
    })
  }

  function handleOpenRequestModal() {
    requireAuth('solicitar micro-ruta de refuerzo', () => {
      setIsRequestModalOpen(true)
    })
  }

  async function handleSendRequest(e: React.FormEvent) {
    e.preventDefault()
    if (!temaRefuerzo.trim() || !estudiante) return

    await solicitarMicroRuta({
      estudiante_id: estudiante.id,
      tema: temaRefuerzo.trim(),
      materia: currentSession.materia,
    })

    setRequestSuccess(true)
    setTimeout(() => {
      setRequestSuccess(false)
      setTemaRefuerzo('')
      setIsRequestModalOpen(false)
    }, 1800)
  }

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
      {/* Header con Materia y Duración */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-xl bg-[#152642]/10 text-[#152642]">
            <BookOpen className="size-4" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            {currentSession.materia}
          </span>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-bold text-slate-700">
          {currentSession.duracion_minutos} MIN
        </span>
      </div>

      {/* Título de la Sesión */}
      <h2 className="mt-4 text-lg sm:text-xl font-black leading-snug tracking-tight text-slate-900">
        {currentSession.tema}
      </h2>

      {/* Meta info: Fecha y Mentor */}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 font-medium">
        <span className="flex items-center gap-1.5">
          <CalendarClock className="size-3.5 text-[#152642]" />
          {currentSession.fecha_programada}
        </span>
        <span className="text-slate-300">·</span>
        <span className="flex items-center gap-1.5">
          <User className="size-3.5 text-slate-400" />
          Mentor: <strong className="text-slate-800">{mentor?.nombre || 'Prof. Asignado'}</strong>
        </span>
      </div>

      {/* Indicaciones del Mentor */}
      <div className="mt-4 rounded-2xl bg-slate-50 p-4 border border-slate-100">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          INDICACIONES PEDAGÓGICAS
        </p>
        <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-700 font-medium">
          {currentSession.notas || 'Repaso de despeje de incógnitas y aplicación en problemas de la vida cotidiana.'}
        </p>
      </div>

      {/* Botones de Acción del Estudiante */}
      <div className="mt-5 space-y-3">
        {isConfirmed ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs sm:text-sm font-bold text-emerald-800">
            <Check className="size-4.5 text-emerald-600 shrink-0" />
            <span>Asistencia Confirmada por el Estudiante · Horas MINERD Validadas</span>
          </div>
        ) : (
          <div className="space-y-3">
            {enteringPin && (
              <div className="rounded-2xl border border-[#152642]/20 bg-[#152642]/5 p-4 animate-in fade-in">
                <label
                  htmlFor="pin-input"
                  className="block text-xs font-bold text-slate-800 mb-2"
                >
                  Ingresa tu PIN de 4 dígitos (Prueba con <span className="text-[#152642] font-black">{estudiante?.pin || '1234'}</span>):
                </label>
                <input
                  id="pin-input"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, ''))
                    setErrorMsg(null)
                  }}
                  placeholder="••••"
                  className={cn(
                    'w-full rounded-xl border bg-white px-4 py-2.5 text-center text-2xl tracking-[0.5em] font-mono font-bold text-slate-900 outline-none transition-all focus:border-[#152642]',
                    errorMsg ? 'border-red-500' : 'border-slate-300'
                  )}
                />
                {errorMsg && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-600">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleConfirmPin}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#152642] px-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#152642]/90 active:scale-[0.98] cursor-pointer"
              >
                <ShieldCheck className="size-4.5 shrink-0" />
                <span>
                  {enteringPin
                    ? 'Validar PIN'
                    : 'Confirmar Asistencia con PIN'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleDirectConfirm}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Check className="size-4 text-emerald-600" />
                <span>Confirmar en 1 Toque</span>
              </button>
            </div>
          </div>
        )}

        {/* Botón: Solicitar Micro-Ruta de Refuerzo */}
        <button
          type="button"
          onClick={handleOpenRequestModal}
          className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-dashed border-blue-300 bg-blue-50/50 px-4 text-xs font-bold text-[#152642] hover:bg-blue-50 transition-all active:scale-[0.99] cursor-pointer"
        >
          <Sparkles className="size-4 text-blue-600" />
          <span>Solicitar Micro-Ruta de Refuerzo Personalizada</span>
        </button>
      </div>

      {/* Modal: Solicitar Micro-Ruta */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl">
            <h4 className="text-base font-black text-slate-900">
              Solicitar Refuerzo Académico
            </h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Pide una micro-ruta en los temas donde sientes mayor debilidad antes del próximo Checkpoint:
            </p>

            {requestSuccess && (
              <div className="mt-3 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span>¡Solicitud enviada a tu Mentor titular!</span>
              </div>
            )}

            <form onSubmit={handleSendRequest} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tema o Ejercicio que necesitas practicar:
                </label>
                <input
                  type="text"
                  required
                  value={temaRefuerzo}
                  onChange={(e) => setTemaRefuerzo(e.target.value)}
                  placeholder="Ej. Despeje de fracciones y cambio de signos"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#152642] focus:ring-2 focus:ring-[#152642]/10 outline-none"
                />
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#152642] py-2.5 text-xs font-bold text-white hover:bg-[#152642]/90 cursor-pointer"
                >
                  <Send className="size-3.5" />
                  <span>Enviar Solicitud</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
