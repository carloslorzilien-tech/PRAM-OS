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
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
      {/* Header con Materia y Duración */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-900">
            <BookOpen className="size-3.5" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            {currentSession.materia}
          </span>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
          {currentSession.duracion_minutos} MIN
        </span>
      </div>

      {/* Título de la Sesión */}
      <h2 className="mt-4 text-base sm:text-lg font-semibold leading-snug tracking-tight text-slate-900">
        {currentSession.tema}
      </h2>

      {/* Meta info: Fecha y Mentor */}
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-normal">
        <span className="flex items-center gap-1.5">
          <CalendarClock className="size-3.5 text-slate-400" />
          {currentSession.fecha_programada}
        </span>
        <span className="text-slate-300">·</span>
        <span className="flex items-center gap-1.5">
          <User className="size-3.5 text-slate-400" />
          Mentor: <strong className="text-slate-800 font-medium">{mentor?.nombre || 'Prof. Asignado'}</strong>
        </span>
      </div>

      {/* Indicaciones del Mentor */}
      <div className="mt-4 rounded-lg bg-slate-50 p-3.5 border border-slate-100">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          INDICACIONES PEDAGÓGICAS
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-700 font-normal">
          {currentSession.notas || 'Repaso de despeje de incógnitas y aplicación en problemas de la vida cotidiana.'}
        </p>
      </div>

      {/* Botones de Acción del Estudiante */}
      <div className="mt-5 space-y-3">
        {isConfirmed ? (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-medium text-emerald-800">
            <Check className="size-4 text-emerald-600 shrink-0" />
            <span>Asistencia Confirmada por el Estudiante · Horas MINERD Validadas</span>
          </div>
        ) : (
          <div className="space-y-3">
            {enteringPin && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <label
                  htmlFor="pin-input"
                  className="block text-xs font-medium text-slate-700 mb-2"
                >
                  Ingresa tu PIN de 4 dígitos (Prueba con <span className="font-mono font-bold text-slate-900">{estudiante?.pin || '1234'}</span>):
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
                    'w-full rounded-md border bg-white px-3 py-2 text-center text-xl tracking-[0.4em] font-mono font-bold text-slate-900 outline-none transition-all focus:border-slate-900 focus:ring-1 focus:ring-slate-900',
                    errorMsg ? 'border-red-500' : 'border-slate-300'
                  )}
                />
                {errorMsg && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleConfirmPin}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-900 px-4 text-xs font-medium text-white transition-colors hover:bg-slate-800 active:scale-[0.99] cursor-pointer"
              >
                <ShieldCheck className="size-4 shrink-0" />
                <span>
                  {enteringPin
                    ? 'Validar PIN'
                    : 'Confirmar con PIN'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleDirectConfirm}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
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
          className="w-full inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-200 bg-slate-50/50 px-3 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <Sparkles className="size-3.5 text-slate-500" />
          <span>Solicitar Micro-Ruta de Refuerzo Personalizada</span>
        </button>
      </div>

      {/* Modal: Solicitar Micro-Ruta */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-lg">
            <h4 className="text-base font-semibold text-slate-900">
              Solicitar Refuerzo Académico
            </h4>
            <p className="text-xs text-slate-500 font-normal mt-1">
              Pide una micro-ruta en los temas donde sientes mayor debilidad antes del próximo Checkpoint:
            </p>

            {requestSuccess && (
              <div className="mt-3 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-medium text-emerald-800">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span>¡Solicitud enviada a tu Mentor titular!</span>
              </div>
            )}

            <form onSubmit={handleSendRequest} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tema o Ejercicio que necesitas practicar:
                </label>
                <input
                  type="text"
                  required
                  value={temaRefuerzo}
                  onChange={(e) => setTemaRefuerzo(e.target.value)}
                  placeholder="Ej. Despeje de fracciones y cambio de signos"
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-normal text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="flex-1 rounded-md border border-slate-200 bg-white py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-slate-900 py-2 text-xs font-medium text-white hover:bg-slate-800 cursor-pointer"
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
