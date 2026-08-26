'use client'

import React, { useEffect, useState } from 'react'
import {
  PlusCircle,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
} from 'lucide-react'
import {
  submitSessionWithHours,
  subscribeToFirebaseSessions,
  subscribeToMentorStudents,
  StudentData,
} from '@/lib/firebase-service'
import { useFirebaseAuth } from '@/lib/firebase-auth'
import { Sesion, MateriaValida } from '@/lib/db'

const MATERIAS: MateriaValida[] = ['Matemáticas', 'Lengua Española']

export function MentorSessionTab() {
  const { user } = useFirebaseAuth()
  const uid = user?.uid || ''

  // Form state
  const [materia, setMateria] = useState<MateriaValida>('Matemáticas')
  const [tema, setTema] = useState('')
  const [horasInvertidas, setHorasInvertidas] = useState<number>(1)
  const [fechaSesion, setFechaSesion] = useState(new Date().toISOString().split('T')[0])
  const [notas, setNotas] = useState('')
  const [checkedStudents, setCheckedStudents] = useState<Set<string>>(new Set())

  // Data
  const [students, setStudents] = useState<StudentData[]>([])
  const [sessions, setSessions] = useState<Sesion[]>([])

  // UI state
  const [submitting, setSubmitting] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const notify = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text })
    setTimeout(() => setNotification(null), 5000)
  }

  useEffect(() => {
    if (!uid) return
    const unsubStudents = subscribeToMentorStudents(uid, setStudents)
    const unsubSessions = subscribeToFirebaseSessions(uid, setSessions)
    return () => { unsubStudents(); unsubSessions() }
  }, [uid])

  const toggleStudent = (id: string) => {
    setCheckedStudents((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tema.trim()) { notify('error', 'El tema de la sesión es obligatorio.'); return }
    if (horasInvertidas <= 0 || !Number.isFinite(horasInvertidas)) {
      notify('error', 'Las horas invertidas deben ser un número positivo.')
      return
    }

    setSubmitting(true)
    const sessionId = await submitSessionWithHours({
      tema: tema.trim(),
      materia,
      horasInvertidas,
      fechaSesion,
      studentIds: Array.from(checkedStudents),
      notas,
    })
    setSubmitting(false)

    if (sessionId) {
      notify('success', `Sesión registrada (${horasInvertidas}h) y enviada a auditoría. ¡Horas acumuladas actualizadas!`)
      setTema('')
      setNotas('')
      setHorasInvertidas(1)
      setCheckedStudents(new Set())
    } else {
      notify('error', 'Error al registrar la sesión en Firestore. Intenta de nuevo.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`flex items-center gap-2 rounded-xl p-3 text-xs font-medium border ${
          notification.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {notification.type === 'success'
            ? <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            : <AlertCircle className="size-4 text-red-600 shrink-0" />
          }
          <span>{notification.text}</span>
        </div>
      )}

      {/* ── Session Form ── */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Fecha */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              <Calendar className="inline size-3 mr-1" />Fecha de la Sesión
            </label>
            <input
              type="date"
              value={fechaSesion}
              onChange={(e) => setFechaSesion(e.target.value)}
              required
              className="w-full h-10 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
            />
          </div>

          {/* Materia */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              <BookOpen className="inline size-3 mr-1" />Materia
            </label>
            <select
              value={materia}
              onChange={(e) => setMateria(e.target.value as MateriaValida)}
              required
              className="w-full h-10 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 cursor-pointer transition-all"
            >
              {MATERIAS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Tema */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Tema Tratado
            </label>
            <input
              type="text"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              required
              placeholder="Ej: Resolución de ecuaciones lineales"
              className="w-full h-10 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
            />
          </div>

          {/* Horas Invertidas */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              <Clock className="inline size-3 mr-1" />Horas Invertidas
            </label>
            <input
              type="number"
              value={horasInvertidas}
              onChange={(e) => setHorasInvertidas(Number(e.target.value))}
              min={0.25}
              max={8}
              step={0.25}
              required
              className="w-full h-10 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">Ej: 1 = 1h, 1.5 = 1h 30min</p>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Notas (Opcional)
            </label>
            <input
              type="text"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Observaciones de la sesión..."
              className="w-full h-10 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
            />
          </div>
        </div>

        {/* Smart Attendance */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Users className="inline size-3 mr-1" />Asistencia ({checkedStudents.size} marcado{checkedStudents.size !== 1 ? 's' : ''})
          </label>
          {students.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center bg-slate-50 rounded-lg border border-slate-200">
              No tienes alumnos registrados aún. Ve a "Gestión de Alumnos" para agregarlos.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {students.map((s) => (
                <label
                  key={s.id}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all text-xs ${
                    checkedStudents.has(s.id)
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checkedStudents.has(s.id)}
                    onChange={() => toggleStudent(s.id)}
                    className="sr-only"
                  />
                  <div className={`size-4 rounded border flex items-center justify-center shrink-0 ${
                    checkedStudents.has(s.id) ? 'bg-white border-white' : 'border-slate-300'
                  }`}>
                    {checkedStudents.has(s.id) && <CheckCircle2 className="size-3 text-slate-900" />}
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold block truncate">{s.fullName}</span>
                    <span className={`text-[10px] ${checkedStudents.has(s.id) ? 'text-slate-300' : 'text-slate-400'}`}>
                      {s.grade} · {s.subject}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 rounded-lg px-6 py-2.5 text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            {submitting ? (
              <><Loader2 className="size-4 animate-spin" /><span>Guardando...</span></>
            ) : (
              <><PlusCircle className="size-4" /><span>Registrar Sesión y Actualizar Horas</span></>
            )}
          </button>
        </div>
      </form>

      {/* ── Session History ── */}
      <div className="space-y-3 border-t border-slate-100 pt-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Historial de Sesiones
          </h3>
          <span className="text-xs text-slate-400">{sessions.length} sesiones</span>
        </div>

        {sessions.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No tienes sesiones registradas aún.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {sessions.map((s) => {
              const isApproved = s.estado === 'approved'
              const isPending = s.estado === 'pending'
              const horas = (s as any).horasInvertidas ?? (s as any).horas_invertidas ?? ((s.duracion_minutos || 45) / 60)

              return (
                <div key={s.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-slate-900">{s.tema || 'Sesión'}</span>
                      <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        {s.materia}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />{s.fecha_sesion}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />{Number(horas).toFixed(2)} h
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {isApproved ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 text-[10px] font-semibold">
                        <CheckCircle2 className="size-3" />Aprobado
                      </span>
                    ) : isPending ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 text-[10px] font-semibold">
                        <Clock className="size-3" />En Auditoría
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 text-[10px] font-semibold">
                        Rechazado
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
