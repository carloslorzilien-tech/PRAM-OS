'use client'

import React, { useEffect, useState } from 'react'
import {
  UserPlus,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  GraduationCap,
  Sparkles,
  Clock,
  BookOpen,
} from 'lucide-react'
import {
  addStudent,
  subscribeToMentorStudents,
  getStudentEvaluations,
  StudentData,
  Evaluacion,
} from '@/lib/firebase-service'
import { useFirebaseAuth } from '@/lib/firebase-auth'
import { StudentEvalModal } from '@/components/pram/student-eval-modal'
import { StudentEvalTimeline } from '@/components/pram/student-eval-timeline'

type Grade = '3ero A' | '3ero B' | '4to A' | '4to B'
type Subject = 'Matemáticas' | 'Lengua Española'

const GRADES: Grade[] = ['3ero A', '3ero B', '4to A', '4to B']
const SUBJECTS: Subject[] = ['Matemáticas', 'Lengua Española']

export function MentorStudentsTab() {
  const { user } = useFirebaseAuth()
  const uid = user?.uid || ''
  const mentorName = user?.displayName || 'Tutor PRAM'

  const [students, setStudents] = useState<StudentData[]>([])
  const [evaluationsMap, setEvaluationsMap] = useState<Map<string, Evaluacion[]>>(new Map())
  const [loading, setLoading] = useState(true)

  // Modal: Nuevo Alumno
  const [showModal, setShowModal] = useState(false)
  const [fullName, setFullName] = useState('')
  const [grade, setGrade] = useState<Grade>('3ero A')
  const [subject, setSubject] = useState<Subject>('Matemáticas')
  const [notaInicial, setNotaInicial] = useState<number>(0)
  const [saving, setSaving] = useState(false)

  // Modal: Nueva Evaluación
  const [evalModalStudent, setEvalModalStudent] = useState<StudentData | null>(null)

  // Expanded student for timeline view
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null)

  // Notification
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const notify = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text })
    setTimeout(() => setNotification(null), 4000)
  }

  // Fetch evaluations for a given student
  const fetchStudentEvals = async (studentId: string) => {
    try {
      const evals = await getStudentEvaluations(studentId)
      setEvaluationsMap((prev) => {
        const next = new Map(prev)
        next.set(studentId, evals)
        return next
      })
    } catch (err) {
      console.error(`Error fetching evals for ${studentId}:`, err)
    }
  }

  // Subscribe to students and load their evaluations
  useEffect(() => {
    if (!uid) return
    const unsub = subscribeToMentorStudents(uid, async (data) => {
      const sorted = data.sort((a, b) => a.fullName.localeCompare(b.fullName))
      setStudents(sorted)
      setLoading(false)

      // Fetch evals for all mentor students
      const map = new Map<string, Evaluacion[]>()
      await Promise.all(
        sorted.map(async (st) => {
          try {
            const ev = await getStudentEvaluations(st.id)
            map.set(st.id, ev)
          } catch {
            map.set(st.id, [])
          }
        })
      )
      setEvaluationsMap(map)
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

  // Helper to extract student evaluation summary
  const getStudentMetrics = (student: StudentData) => {
    const evals = evaluationsMap.get(student.id) || []
    const quizEvals = evals.filter((e) => e.tipo === 'QUIZ')
    const examenFinal = evals.find((e) => e.tipo === 'EXAMEN_FINAL')

    const lastQuiz = quizEvals.length > 0 ? quizEvals[quizEvals.length - 1] : null
    const latestGrade = lastQuiz ? lastQuiz.calificacion : student.notaInicial
    const base = Number.isFinite(student.notaInicial) ? student.notaInicial : 0

    const delta = lastQuiz ? lastQuiz.calificacion - base : 0
    const hasFinal = !!examenFinal

    return {
      evalCount: evals.length,
      quizCount: quizEvals.length,
      lastQuizScore: lastQuiz ? lastQuiz.calificacion : null,
      delta: lastQuiz ? delta : null,
      hasFinal,
      finalScore: examenFinal?.calificacion ?? null,
    }
  }

  // Progress delta badge
  const renderDeltaBadge = (delta: number | null) => {
    if (delta === null) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold">
          <Minus className="size-3" /> —
        </span>
      )
    }
    if (delta > 0) return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
        <TrendingUp className="size-3" />+{delta.toFixed(1)} pts
      </span>
    )
    if (delta < 0) return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 text-[10px] font-bold">
        <TrendingDown className="size-3" />{delta.toFixed(1)} pts
      </span>
    )
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-0.5 text-[10px] font-semibold">
        <Minus className="size-3" /> 0.0 pts
      </span>
    )
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
            : <AlertCircle className="size-4 text-red-600 shrink-0" />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Header + Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Seguimiento Temporal y Quizzes</h3>
            <span className="rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5">
              {students.length} alumno{students.length !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Aplica evaluaciones periódicas para registrar la curva real de aprendizaje.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg px-4 py-2 text-xs font-semibold shadow-sm transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="size-4" />
          <span>Nuevo Alumno</span>
        </button>
      </div>

      {/* Students Table */}
      {loading ? (
        <div className="flex justify-center py-12 text-slate-400">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : students.length === 0 ? (
        <div className="py-16 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <GraduationCap className="size-10 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-900">Sin alumnos registrados</p>
          <p className="text-xs text-slate-500">Registra tus primeros alumnos para iniciar las evaluaciones periódicas.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Alumno</th>
                <th className="px-4 py-3">Curso</th>
                <th className="px-4 py-3 hidden md:table-cell">Materia</th>
                <th className="px-4 py-3 text-right">Diagnóstico</th>
                <th className="px-4 py-3 text-right">Último Quiz</th>
                <th className="px-4 py-3 text-center">Quizzes</th>
                <th className="px-4 py-3 text-right">Progreso $\Delta$</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {students.map((s) => {
                const metrics = getStudentMetrics(s)
                const isExpanded = expandedStudentId === s.id
                const evals = evaluationsMap.get(s.id) || []

                return (
                  <React.Fragment key={s.id}>
                    <tr className={`hover:bg-slate-50/80 transition-colors ${isExpanded ? 'bg-slate-50/60' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{s.fullName}</div>
                        <div className="text-[10px] text-slate-400 md:hidden">{s.subject}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 text-[10px] font-medium">
                          {s.grade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{s.subject}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                        {s.notaInicial}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {metrics.lastQuizScore !== null ? (
                          <span className="font-bold text-slate-900">{metrics.lastQuizScore}</span>
                        ) : (
                          <span className="text-slate-400 italic">Pendiente</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                          <BookOpen className="size-3 text-slate-400" />
                          {metrics.quizCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {renderDeltaBadge(metrics.delta)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEvalModalStudent(s)}
                            className="inline-flex items-center gap-1 bg-slate-900 text-white hover:bg-slate-800 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer shadow-xs"
                            title="Registrar nuevo quiz o examen final"
                          >
                            <PlusCircle className="size-3" />
                            <span>Evaluar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpandedStudentId(isExpanded ? null : s.id)}
                            className="inline-flex items-center gap-1 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg px-2 py-1 text-[11px] font-medium transition-all cursor-pointer"
                            title="Ver curva de progreso"
                          >
                            <span>Curva</span>
                            {isExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Timeline Expansion */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={8} className="p-0">
                          <div className="bg-slate-50/90 border-y border-slate-200 p-6 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                              <div className="flex items-center gap-2">
                                <Sparkles className="size-4 text-indigo-600" />
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                  Historial Temporal de Evaluaciones · {s.fullName}
                                </h4>
                              </div>
                              <span className="text-[11px] text-slate-500 font-medium">
                                {evals.length} registro(s) inmutables
                              </span>
                            </div>

                            <StudentEvalTimeline
                              notaInicial={s.notaInicial}
                              evaluaciones={evals}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal: Registrar Evaluación (Quiz / Examen Final) ── */}
      {evalModalStudent && (
        <StudentEvalModal
          studentId={evalModalStudent.id}
          studentName={evalModalStudent.fullName}
          existingEvals={evaluationsMap.get(evalModalStudent.id) || []}
          onClose={() => setEvalModalStudent(null)}
          onSuccess={() => {
            fetchStudentEvals(evalModalStudent.id)
            notify('success', `Evaluación registrada para ${evalModalStudent.fullName}. Curva de aprendizaje actualizada.`)
          }}
        />
      )}

      {/* ── Modal: Nuevo Alumno ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Registrar Nuevo Alumno</h2>
                <p className="text-xs text-slate-500">El diagnóstico inicial será la base fija para medir su progreso.</p>
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
                  Nota de Diagnóstico Inicial (0–100)
                </label>
                <input
                  type="number"
                  value={notaInicial}
                  onChange={(e) => setNotaInicial(Number(e.target.value))}
                  min={0} max={100} step={0.5}
                  required
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Esta nota se mantendrá inmutable como punto de partida comparativo.
                </p>
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

