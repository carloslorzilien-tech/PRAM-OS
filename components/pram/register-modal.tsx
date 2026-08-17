'use client'

import React, { useState } from 'react'
import {
  UserPlus,
  CheckCircle2,
  X,
} from 'lucide-react'
import { usePram } from '@/lib/pram-context'
import { GradoSecundaria, MentorRango } from '@/types/pram'
import { cn } from '@/lib/utils'

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: 'estudiante' | 'mentor'
}

export function RegisterModal({
  isOpen,
  onClose,
  defaultTab = 'estudiante',
}: RegisterModalProps) {
  const { mentores, registrarNuevoEstudiante, registrarNuevoMentor } = usePram()
  const [tab, setTab] = useState<'estudiante' | 'mentor'>(defaultTab)

  // Formulario Estudiante
  const [nombreEstudiante, setNombreEstudiante] = useState('')
  const [gradoEstudiante, setGradoEstudiante] = useState<GradoSecundaria>('3ro')
  const [seccionEstudiante, setSeccionEstudiante] = useState('Liceo Minerva Mirabal · 3ro B')
  const [pinEstudiante, setPinEstudiante] = useState(
    String(Math.floor(1000 + Math.random() * 9000))
  )
  const [mentorIdEstudiante, setMentorIdEstudiante] = useState(mentores[0]?.id || 'm-1')

  // Formulario Mentor
  const [nombreMentor, setNombreMentor] = useState('')
  const [rangoMentor, setRangoMentor] = useState<MentorRango>('Junior')
  const [especialidadMentor, setEspecialidadMentor] = useState('Matemáticas · Álgebra')

  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  if (!isOpen) return null

  const handleRegisterEstudiante = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombreEstudiante.trim()) return

    const nuevo = await registrarNuevoEstudiante({
      nombre: nombreEstudiante.trim(),
      pin: pinEstudiante,
      grado: gradoEstudiante,
      liceo_seccion: seccionEstudiante,
      mentor_id: mentorIdEstudiante,
    })

    setSuccessMessage(`¡Estudiante ${nuevo.nombre} registrado con PIN: ${nuevo.pin}!`)
    setTimeout(() => {
      setSuccessMessage(null)
      setNombreEstudiante('')
      onClose()
    }, 1800)
  }

  const handleRegisterMentor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombreMentor.trim()) return

    const nuevo = await registrarNuevoMentor({
      nombre: nombreMentor.trim(),
      rango: rangoMentor,
      especialidad: especialidadMentor,
    })

    setSuccessMessage(`¡Mentor ${nuevo.nombre} registrado para servicio social MINERD!`)
    setTimeout(() => {
      setSuccessMessage(null)
      setNombreMentor('')
      onClose()
    }, 1800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-lg">
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="size-4" />
        </button>

        {/* Encabezado */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-slate-900 text-white">
            <UserPlus className="size-4.5" />
          </div>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-slate-900">
              Alta de Usuarios PRAM
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              Registro con asignación de cohorte y generación de PIN
            </p>
          </div>
        </div>

        {/* Pestañas de Selección */}
        <div className="mt-4 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setTab('estudiante')}
            className={cn(
              'rounded-md py-1.5 text-center text-xs font-medium transition-colors cursor-pointer',
              tab === 'estudiante'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            Nuevo Estudiante
          </button>
          <button
            type="button"
            onClick={() => setTab('mentor')}
            className={cn(
              'rounded-md py-1.5 text-center text-xs font-medium transition-colors cursor-pointer',
              tab === 'mentor'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            Nuevo Mentor
          </button>
        </div>

        {/* Mensaje de Éxito */}
        {successMessage && (
          <div className="mt-3 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-medium text-emerald-800">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Formulario Estudiante */}
        {tab === 'estudiante' && (
          <form onSubmit={handleRegisterEstudiante} className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nombre Completo:
              </label>
              <input
                type="text"
                required
                value={nombreEstudiante}
                onChange={(e) => setNombreEstudiante(e.target.value)}
                placeholder="Ej. Ana Lucía Peralta"
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-normal text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Grado Secundaria:
                </label>
                <select
                  value={gradoEstudiante}
                  onChange={(e) => setGradoEstudiante(e.target.value as GradoSecundaria)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-normal text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none cursor-pointer"
                >
                  <option value="3ro">3ro Secundaria</option>
                  <option value="4to">4to Secundaria</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  PIN Nómada (4 dígitos):
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    maxLength={4}
                    value={pinEstudiante}
                    onChange={(e) => setPinEstudiante(e.target.value.replace(/\D/g, ''))}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-center font-mono text-xs font-bold text-slate-900 focus:border-slate-900 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setPinEstudiante(String(Math.floor(1000 + Math.random() * 9000)))}
                    className="rounded-md border border-slate-200 bg-slate-100 px-2.5 text-[10px] font-medium text-slate-700 hover:bg-slate-200 cursor-pointer"
                  >
                    GEN
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Liceo y Sección:
              </label>
              <input
                type="text"
                value={seccionEstudiante}
                onChange={(e) => setSeccionEstudiante(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-normal text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Mentor Asignado:
              </label>
              <select
                value={mentorIdEstudiante}
                onChange={(e) => setMentorIdEstudiante(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-normal text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none cursor-pointer"
              >
                {mentores.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre} ({m.rango})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full h-10 inline-flex items-center justify-center rounded-md bg-slate-900 text-xs font-medium text-white transition-colors hover:bg-slate-800 cursor-pointer mt-2"
            >
              Registrar Estudiante →
            </button>
          </form>
        )}

        {/* Formulario Mentor */}
        {tab === 'mentor' && (
          <form onSubmit={handleRegisterMentor} className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nombre del Mentor:
              </label>
              <input
                type="text"
                required
                value={nombreMentor}
                onChange={(e) => setNombreMentor(e.target.value)}
                placeholder="Ej. Ing. Daniel Vásquez"
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-normal text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Rango Docente:
                </label>
                <select
                  value={rangoMentor}
                  onChange={(e) => setRangoMentor(e.target.value as MentorRango)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-normal text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none cursor-pointer"
                >
                  <option value="Junior">Junior (En formación)</option>
                  <option value="Senior">Senior (Evaluador)</option>
                  <option value="Head">Head (Director cohorte)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Especialidad:
                </label>
                <input
                  type="text"
                  value={especialidadMentor}
                  onChange={(e) => setEspecialidadMentor(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-normal text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-10 inline-flex items-center justify-center rounded-md bg-slate-900 text-xs font-medium text-white transition-colors hover:bg-slate-800 cursor-pointer mt-2"
            >
              Registrar Mentor MINERD →
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
