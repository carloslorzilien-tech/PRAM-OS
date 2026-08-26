'use client'

import React, { useEffect, useState } from 'react'
import {
  UserPlus,
  Pencil,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  GraduationCap,
} from 'lucide-react'
import {
  addStudent,
  subscribeToMentorStudents,
  updateStudentGrade,
  StudentData,
} from '@/lib/firebase-service'
import { useFirebaseAuth } from '@/lib/firebase-auth'

type Grade = '3ero A' | '3ero B' | '4to A' | '4to B'
type Subject = 'Matemáticas' | 'Lengua Española'

const GRADES: Grade[] = ['3ero A', '3ero B', '4to A', '4to B']
const SUBJECTS: Subject[] = ['Matemáticas', 'Lengua Española']

interface InlineEdit {
  studentId: string
  field: 'notaSeguimiento' | 'notaPeriodo'
  currentValue: number | null
}

export function MentorStudentsTab() {
  const { user } = useFirebaseAuth()
  const uid = user?.uid || ''
  const mentorName = user?.displayName || 'Tutor PRAM'

  const [students, setStudents] = useState<StudentData[]>([])
  const [loading, setLoading] = useState(true)

  // Modal: Nuevo Alumno
  const [showModal, setShowModal] = useState(false)
  const [fullName, setFullName] = useState('')
  const [grade, setGrade] = useState<Grade>('3ero A')
  const [subject, setSubject] = useState<Subject>('Matemáticas')
  const [notaInicial, setNotaInicial] = useState<number>(0)
  const [saving, setSaving] = useState(false)

  // Inline edit
  const [inlineEdit, setInlineEdit] = useState<InlineEdit | null>(null)
  const [inlineValue, setInlineValue] = useState('')
  const [savingInline, setSavingInline] = useState(false)

  // Notification
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const notify = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text })
    setTimeout(() => setNotification(null), 4000)
  }

  useEffect(() => {
    if (!uid) return
    const unsub = subscribeToMentorStudents(uid, (data) => {
      setStudents(data.sort((a, b) => a.fullName.localeCompare(b.fullName)))
      setLoading(false)
    })
    return () => unsub()
  }, [uid])

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) { notify('error', 'El nombre del alumno es obligatorio.'); return }
    if (!Number.isFinite(notaInicial) || notaInicial < 0 || notaInicial > 100) {
      notify('error', 'La nota inicial debe estar entre 0 y 100.'); return
    }

    setSaving(true)
    const result = await addStudent({
      mentorUid: uid,
      mentorName,
      fullName: fullName.trim(),
      grade,
      subject,
      notaInicial,
      notaSeguimiento: null,
      notaPeriodo: null,
    })
    setSaving(false)

    if (result) {
      notify('success', `Alumno ${fullName} registrado exitosamente.`)
      setFullName(''); setNotaInicial(0); setGrade('3ero A'); setSubject('Matemáticas')
      setShowModal(false)
    } else {
      notify('error', 'Error al registrar el alumno en Firestore.')
    }
  }

  const openInlineEdit = (studentId: string, field: 'notaSeguimiento' | 'notaPeriodo', current: number | null | undefined) => {
    setInlineEdit({ studentId, field, currentValue: current ?? null })
    setInlineValue(current != null ? String(current) : '')
  }

  const submitInlineEdit = async () => {
    if (!inlineEdit) return
    const parsed = parseFloat(inlineValue)
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
      notify('error', 'La nota debe ser un número entre 0 y 100.')
      return
    }
    setSavingInline(true)
    const success = await updateStudentGrade(inlineEdit.studentId, {
      [inlineEdit.field]: parsed,
    })
    setSavingInline(false)

    if (success) {
      const label = inlineEdit.field === 'notaSeguimiento' ? 'Último Quiz' : 'Nota de Período'
      notify('success', `${label} actualizado a ${parsed}.`)
    } else {
      notify('error', 'Error al actualizar la nota.')
    }
    setInlineEdit(null)
    setInlineValue('')
  }

  // Progress delta badge
  const deltaBadge = (s: StudentData) => {
    const base = Number.isFinite(s.notaInicial) ? s.notaInicial : 0
    const current = Number.isFinite(s.notaSeguimiento ?? undefined) ? (s.notaSeguimiento as number) : null
    if (current === null) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold">
          <Minus className="size-3" /> —
        </span>
      )
    }
    const delta = current - base
    if (delta > 0) return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold">
        <TrendingUp className="size-3" />+{delta.toFixed(1)}
      </span>
    )
    if (delta < 0) return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 text-[10px] font-semibold">
        <TrendingDown className="size-3" />{delta.toFixed(1)}
      </span>
    )
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold">
        <Minus className="size-3" /> 0
      </span>
    )
  }

  return (
    <div className="space-y-5">
      {/* Notification */}
      {notification && (
        <div className={`flex items-center gap-2 rounded-xl p-3 text-xs font-medium border ${
          notification.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {notification.type === 'success'
            ? <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            : <AlertCircle className="size-4 text-red-600 shrink-0" />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Header + Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Directorio de Alumnos</h3>
          <p className="text-xs text-slate-500">{students.length} alumno{students.length !== 1 ? 's' : ''} registrado{students.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg px-4 py-2.5 text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <UserPlus className="size-4" />
          <span>Nuevo Alumno</span>
        </button>
      </div>

      {/* Students Table */}
      {loading ? (
        <div className="flex justify-center py-12 text-slate-400">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : students.length === 0 ? (
        <div className="py-16 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <GraduationCap className="size-10 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-900">Sin alumnos aún</p>
          <p className="text-xs text-slate-500">Registra tu primer alumno para comenzar el seguimiento académico.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Curso</th>
                <th className="px-4 py-3 hidden sm:table-cell">Materia</th>
                <th className="px-4 py-3 text-right">Diagnóstico</th>
                <th className="px-4 py-3 text-right">Último Quiz</th>
                <th className="px-4 py-3 text-right">Período</th>
                <th className="px-4 py-3 text-right">Progreso Δ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900">{s.fullName}</td>
                  <td className="px-4 py-3 text-slate-600">{s.grade}</td>
                  <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{s.subject}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-900 font-bold">
                    {Number.isFinite(s.notaInicial) ? s.notaInicial : '—'}
                  </td>

                  {/* Último Quiz — inline edit */}
                  <td className="px-4 py-3 text-right">
                    {inlineEdit?.studentId === s.id && inlineEdit.field === 'notaSeguimiento' ? (
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="number" min={0} max={100} step={0.1}
                          value={inlineValue}
                          onChange={(e) => setInlineValue(e.target.value)}
                          className="w-16 h-7 px-1.5 text-xs border border-slate-300 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                          autoFocus
                        />
                        <button onClick={submitInlineEdit} disabled={savingInline}
                          className="h-7 px-2 bg-slate-900 text-white rounded-lg text-[10px] font-semibold disabled:opacity-50 cursor-pointer">
                          {savingInline ? <Loader2 className="size-3 animate-spin" /> : '✓'}
                        </button>
                        <button onClick={() => setInlineEdit(null)}
                          className="h-7 px-1.5 text-slate-400 hover:text-slate-700 cursor-pointer">
                          <X className="size-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="inline-flex items-center justify-end gap-1 group">
                        <span className="font-mono text-slate-700">
                          {s.notaSeguimiento != null ? s.notaSeguimiento : '—'}
                        </span>
                        <button
                          onClick={() => openInlineEdit(s.id, 'notaSeguimiento', s.notaSeguimiento ?? null)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-700 cursor-pointer"
                          title="Editar nota"
                        >
                          <Pencil className="size-3" />
                        </button>
                      </span>
                    )}
                  </td>

                  {/* Nota Período — inline edit */}
                  <td className="px-4 py-3 text-right">
                    {inlineEdit?.studentId === s.id && inlineEdit.field === 'notaPeriodo' ? (
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="number" min={0} max={100} step={0.1}
                          value={inlineValue}
                          onChange={(e) => setInlineValue(e.target.value)}
                          className="w-16 h-7 px-1.5 text-xs border border-slate-300 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                          autoFocus
                        />
                        <button onClick={submitInlineEdit} disabled={savingInline}
                          className="h-7 px-2 bg-slate-900 text-white rounded-lg text-[10px] font-semibold disabled:opacity-50 cursor-pointer">
                          {savingInline ? <Loader2 className="size-3 animate-spin" /> : '✓'}
                        </button>
                        <button onClick={() => setInlineEdit(null)}
                          className="h-7 px-1.5 text-slate-400 hover:text-slate-700 cursor-pointer">
                          <X className="size-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="inline-flex items-center justify-end gap-1 group">
                        <span className="font-mono text-slate-700">
                          {s.notaPeriodo != null ? s.notaPeriodo : '—'}
                        </span>
                        <button
                          onClick={() => openInlineEdit(s.id, 'notaPeriodo', s.notaPeriodo ?? null)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-700 cursor-pointer"
                          title="Editar nota"
                        >
                          <Pencil className="size-3" />
                        </button>
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right">{deltaBadge(s)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal: Nuevo Alumno ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Registrar Nuevo Alumno</h2>
                <p className="text-xs text-slate-500">Completa los datos para iniciar el seguimiento académico.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer transition-colors">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Ej: María García López"
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Curso / Sección
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value as Grade)}
                    required
                    className="w-full h-10 px-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 cursor-pointer"
                  >
                    {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Materia
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as Subject)}
                    required
                    className="w-full h-10 px-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 cursor-pointer"
                  >
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Nota de Diagnóstico (0–100)
                </label>
                <input
                  type="number"
                  value={notaInicial}
                  onChange={(e) => setNotaInicial(Number(e.target.value))}
                  min={0} max={100} step={0.5}
                  required
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer"
                >
                  {saving ? <><Loader2 className="size-4 animate-spin" /><span>Guardando...</span></> : <><UserPlus className="size-4" /><span>Registrar Alumno</span></>}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
