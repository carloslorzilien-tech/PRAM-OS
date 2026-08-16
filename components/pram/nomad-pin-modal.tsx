'use client'

import React, { useState, useEffect } from 'react'
import { ShieldCheck, CheckCircle2, AlertCircle, X, TabletSmartphone } from 'lucide-react'
import { usePram } from '@/lib/pram-context'
import { Sesion } from '@/types/pram'
import { cn } from '@/lib/utils'

interface NomadPinModalProps {
  isOpen: boolean
  onClose: () => void
  sesion: Sesion | null
}

export function NomadPinModal({ isOpen, onClose, sesion }: NomadPinModalProps) {
  const { confirmarAsistenciaNomada, getEstudianteById } = usePram()
  const [pin, setPin] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const estudiante = sesion ? getEstudianteById(sesion.estudiante_id) : null

  useEffect(() => {
    if (isOpen) {
      setPin('')
      setErrorMsg(null)
      setIsSuccess(false)
    }
  }, [isOpen])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isSuccess) {
      timer = setTimeout(() => {
        onClose()
      }, 1800)
    }
    return () => clearTimeout(timer)
  }, [isSuccess, onClose])

  if (!isOpen || !sesion || !estudiante) return null

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num
      setPin(newPin)
      setErrorMsg(null)
      if (newPin.length === 4) {
        ejecutarValidacion(newPin)
      }
    }
  }

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1))
    setErrorMsg(null)
  }

  const ejecutarValidacion = (pinValidar: string) => {
    const res = confirmarAsistenciaNomada(sesion.id, pinValidar)
    if (res.success) {
      setIsSuccess(true)
      setErrorMsg(null)
    } else {
      setErrorMsg(res.message)
      setPin('')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-2xl">
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="size-5" />
        </button>

        {/* Encabezado */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-[#152642] text-white shadow-sm">
            <TabletSmartphone className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-black tracking-tight text-slate-900">
              Terminal Nómada MINERD
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Validación de Asistencia por PIN Compartido
            </p>
          </div>
        </div>

        {/* Info del Estudiante */}
        <div className="mt-4 rounded-2xl bg-slate-50 p-4 border border-slate-100">
          <p className="text-sm font-bold text-slate-900">
            Alumno: {estudiante.nombre}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Grado: {estudiante.grado} · Sesión: {sesion.tema}
          </p>
          <p className="text-[11px] font-semibold text-[#152642] mt-1.5">
            * PIN registrado para prueba: <strong className="font-mono">{estudiante.pin}</strong>
          </p>
        </div>

        {/* Visualizador del PIN */}
        <div className="mt-5">
          <div className="flex justify-center gap-3">
            {[0, 1, 2, 3].map((idx) => {
              const char = pin[idx]
              return (
                <div
                  key={idx}
                  className={cn(
                    'flex size-14 items-center justify-center rounded-2xl border-2 font-mono text-2xl font-black transition-all shadow-xs',
                    char
                      ? 'border-[#152642] bg-[#152642]/5 text-[#152642]'
                      : 'border-slate-200 bg-white text-transparent',
                    errorMsg && 'border-rose-500 bg-rose-50'
                  )}
                >
                  {char ? '•' : ''}
                </div>
              )
            })}
          </div>

          {errorMsg && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-600">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess && (
            <div className="mt-3 flex items-center justify-center gap-1.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
              <span>¡Asistencia Validada y Firmada Digitalmente!</span>
            </div>
          )}
        </div>

        {/* Teclado Numérico */}
        <div className="mt-6 grid grid-cols-3 gap-2.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              disabled={isSuccess}
              className="flex h-13 items-center justify-center rounded-2xl border border-slate-200 bg-white text-lg font-bold text-slate-800 shadow-2xs hover:bg-slate-50 active:bg-slate-100 transition-all cursor-pointer"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSuccess}
            className="flex h-13 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            BORRAR
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            disabled={isSuccess}
            className="flex h-13 items-center justify-center rounded-2xl border border-slate-200 bg-white text-lg font-bold text-slate-800 shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => {
              if (pin.length === 4) ejecutarValidacion(pin)
            }}
            disabled={pin.length !== 4 || isSuccess}
            className="flex h-13 items-center justify-center rounded-2xl bg-[#152642] text-xs font-bold uppercase text-white shadow-sm hover:bg-[#152642]/90 disabled:opacity-40 transition-all cursor-pointer"
          >
            VALIDAR
          </button>
        </div>
      </div>
    </div>
  )
}
