'use client'

import React, { useEffect, useState, useMemo } from 'react'
import {
  subscribeToAllStudents,
  getStudentEvaluations,
  StudentData,
  Evaluacion,
} from '@/lib/firebase-service'
import { useFirebaseAuth } from '@/lib/firebase-auth'
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Search,
  BookOpen,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react'
import { StudentEvalTimeline } from '@/components/pram/student-eval-timeline'

type SortOption = 'delta_desc' | 'calificacion_desc' | 'nombre_asc' | 'delta_asc' | 'evals_desc'

export function DirectorStudentsOverview() {
  const { user } = useFirebaseAuth()

  const [students, setStudents] = useState<StudentData[]>([])
  const [evaluationsMap, setEvaluationsMap] = useState<Map<string, Evaluacion[]>>(new Map())
  const [loading, setLoading] = useState(true)

  // Filters state
  const [selectedGrade, setSelectedGrade] = useState<string>('Todos')
  const [selectedSubject, setSelectedSubject] = useState<string>('Todas')
  const [selectedMentor, setSelectedMentor] = useState<string>('Todos')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [sortBy, setSortBy] = useState<SortOption>('delta_desc')

  // Expanded student
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null)

  // Subscribe to all students and fetch evaluations
  useEffect(() => {
    const unsubscribe = subscribeToAllStudents(async (studentList) => {
      try {
        setStudents(studentList)

        const map = new Map<string, Evaluacion[]>()
        await Promise.all(
          studentList.map(async (student) => {
            try {
              const evals = await getStudentEvaluations(student.id)
              map.set(student.id, evals)
            } catch (err) {
              console.error(`[DirectorStudentsOverview] Error al cargar evaluaciones de ${student.id}:`, err)
              map.set(student.id, [])
            }
          })
        )
        setEvaluationsMap(map)
      } catch (error) {
        console.error('[DirectorStudentsOverview] Error de suscripción:', error)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  // Extract unique mentor names for filter dropdown
  const uniqueMentors = useMemo(() => {
    const set = new Set<string>()
    students.forEach((s) => {
      if (s.mentorName && s.mentorName.trim().length > 0) {
        set.add(s.mentorName.trim())
      }
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [students])

  // Helper to extract student evaluation info
  const getStudentMetrics = (student: StudentData) => {
    const evals = evaluationsMap.get(student.id) || []
    const quizEvals = evals.filter((e) => e.tipo === 'QUIZ')
    const examenFinal = evals.find((e) => e.tipo === 'EXAMEN_FINAL')
    
    // Sort quiz evaluations chronologically
    const sortedQuizzes = [...quizEvals].sort((a, b) => {
      const dateA = a.fecha ? new Date(a.fecha).getTime() : 0
      const dateB = b.fecha ? new Date(b.fecha).getTime() : 0
      return dateA - dateB
    })

    const lastQuizEval = sortedQuizzes.length > 0 ? sortedQuizzes[sortedQuizzes.length - 1] : null
    
    const lastQuizGrade: number | null =
      lastQuizEval != null && Number.isFinite(lastQuizEval.calificacion)
        ? lastQuizEval.calificacion
        : Number.isFinite(student.notaSeguimiento)
        ? (student.notaSeguimiento as number)
        : null

    const notaInicial = Number.isFinite(student.notaInicial) ? student.notaInicial : 0

    const delta: number | null =
      lastQuizGrade !== null && Number.isFinite(lastQuizGrade)
        ? lastQuizGrade - notaInicial
        : null

    return {
      evalCount: evals.length,
      quizCount: quizEvals.length,
      lastQuizGrade,
      notaInicial,
      delta,
      hasQuiz: lastQuizGrade !== null,
      hasFinal: !!examenFinal,
      finalGrade: examenFinal?.calificacion ?? null,
    }
  }

  // KPIs calculations
  const kpis = useMemo(() => {
    const totalStudents = students.length

    let totalDelta = 0
    let studentsWithQuiz = 0
    let positiveCount = 0
    let totalEvaluaciones = 0

    evaluationsMap.forEach((evalList) => {
      totalEvaluaciones += evalList.length
    })

    students.forEach((student) => {
      const { delta, hasQuiz } = getStudentMetrics(student)
      if (hasQuiz && delta !== null && Number.isFinite(delta)) {
        totalDelta += delta
        studentsWithQuiz += 1
        if (delta > 0) {
          positiveCount += 1
        }
      }
    })

    const avgDelta = studentsWithQuiz > 0 ? totalDelta / studentsWithQuiz : null
    const pctPositive =
      studentsWithQuiz > 0 ? Math.round((positiveCount / studentsWithQuiz) * 100) : null

    return {
      totalStudents,
      avgDelta: avgDelta !== null && Number.isFinite(avgDelta) ? avgDelta : null,
      pctPositive: pctPositive !== null && Number.isFinite(pctPositive) ? pctPositive : null,
      totalEvaluaciones,
    }
  }, [students, evaluationsMap])

  // Filtered & Sorted student list
  const processedStudents = useMemo(() => {
    const filtered = students.filter((student) => {
      if (selectedGrade !== 'Todos' && student.grade !== selectedGrade) {
        return false
      }
      if (selectedSubject !== 'Todas' && student.subject !== selectedSubject) {
        return false
      }
      if (selectedMentor !== 'Todos' && (student.mentorName || '').trim() !== selectedMentor) {
        return false
      }
      if (searchTerm.trim().length > 0) {
        const query = searchTerm.toLowerCase().trim()
        const matchesName = student.fullName.toLowerCase().includes(query)
        const matchesMentor = (student.mentorName || '').toLowerCase().includes(query)
        if (!matchesName && !matchesMentor) return false
      }
      return true
    })

    return filtered.sort((a, b) => {
      const metricsA = getStudentMetrics(a)
      const metricsB = getStudentMetrics(b)

      if (sortBy === 'delta_desc') {
        const deltaA = metricsA.delta ?? -999
        const deltaB = metricsB.delta ?? -999
        return deltaB - deltaA
      }
      if (sortBy === 'delta_asc') {
        const deltaA = metricsA.delta ?? 999
        const deltaB = metricsB.delta ?? 999
        return deltaA - deltaB
      }
      if (sortBy === 'calificacion_desc') {
        const scoreA = metricsA.lastQuizGrade ?? metricsA.notaInicial
        const scoreB = metricsB.lastQuizGrade ?? metricsB.notaInicial
        return scoreB - scoreA
      }
      if (sortBy === 'nombre_asc') {
        return a.fullName.localeCompare(b.fullName)
      }
      if (sortBy === 'evals_desc') {
        return metricsB.evalCount - metricsA.evalCount
      }
      return 0
    })
  }, [students, evaluationsMap, selectedGrade, selectedSubject, selectedMentor, searchTerm, sortBy])

  // Render delta badge
  const renderDeltaBadge = (delta: number | null) => {
    if (delta === null || !Number.isFinite(delta)) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold">
          <Minus className="size-3" /> —
        </span>
      )
    }
    if (delta > 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
          <TrendingUp className="size-3 text-emerald-600" />+{delta.toFixed(1)} pts
        </span>
      )
    }
    if (delta < 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 text-[10px] font-bold">
          <TrendingDown className="size-3 text-red-600" />{delta.toFixed(1)} pts
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-0.5 text-[10px] font-semibold">
        <Minus className="size-3" /> 0.0 pts
      </span>
    )
  }

  // Render institutional status badge based on personal progress (growth vs. baseline)
  const renderStatusBadge = (delta: number | null, evalCount: number) => {
    if (evalCount === 0 || delta === null || !Number.isFinite(delta)) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 text-[10px] font-medium">
          Diagnóstico Base
        </span>
      )
    }
    if (delta >= 15) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
          <span className="size-1.5 rounded-full bg-emerald-600" />
          <span>Crecimiento Sobresaliente</span>
        </span>
      )
    }
    if (delta >= 5) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-semibold">
          <span className="size-1.5 rounded-full bg-indigo-600" />
          <span>Avance Sostenido</span>
        </span>
      )
    }
    if (delta > 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold">
          <span>Progreso Inicial</span>
        </span>
      )
    }
    if (delta === 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 text-[10px] font-medium">
          <span>En Nivelación</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold">
        <span>Refuerzo Prioritario</span>
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
        <Loader2 className="size-6 animate-spin" />
        <span className="text-xs">Cargando métricas de evolución académica...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Alumnos */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Alumnos en Seguimiento
          </span>
          <div className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            {kpis.totalStudents}
          </div>
        </div>

        {/* Evolución Media */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Evolución Media ($\Delta$)
          </span>
          <div
            className={`text-3xl sm:text-4xl font-bold tracking-tight ${
              kpis.avgDelta === null
                ? 'text-slate-400'
                : kpis.avgDelta > 0
                ? 'text-emerald-600'
                : kpis.avgDelta < 0
                ? 'text-red-600'
                : 'text-slate-900'
            }`}
          >
            {kpis.avgDelta !== null
              ? `${kpis.avgDelta > 0 ? '+' : ''}${kpis.avgDelta.toFixed(1)} pts`
              : '—'}
          </div>
        </div>

        {/* Tasa de Superación */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Tasa de Superación
          </span>
          <div className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            {kpis.pctPositive !== null ? `${kpis.pctPositive}%` : '—'}
          </div>
        </div>

        {/* Total Evaluaciones */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Evaluaciones Asentadas
          </span>
          <div className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            {kpis.totalEvaluaciones}
          </div>
        </div>
      </div>

      {/* 2. Controls & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 size-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar estudiante o tutor..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Ordenar */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Orden:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-9 text-xs font-semibold px-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
            >
              <option value="delta_desc">Mayor Evolución ($\Delta$)</option>
              <option value="calificacion_desc">Calificación Más Reciente</option>
              <option value="nombre_asc">Nombre (A–Z)</option>
              <option value="delta_asc">Prioridad de Refuerzo</option>
              <option value="evals_desc">Mayor Historial</option>
            </select>
          </div>

          {/* Curso Filter */}
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="h-9 text-xs font-semibold px-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
          >
            <option value="Todos">Todos los Cursos</option>
            <option value="3ero A">3ero A</option>
            <option value="3ero B">3ero B</option>
            <option value="4to A">4to A</option>
            <option value="4to B">4to B</option>
          </select>

          {/* Materia Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="h-9 text-xs font-semibold px-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
          >
            <option value="Todas">Todas las Materias</option>
            <option value="Matemáticas">Matemáticas</option>
            <option value="Lengua Española">Lengua Española</option>
          </select>

          {/* Mentor Filter */}
          <select
            value={selectedMentor}
            onChange={(e) => setSelectedMentor(e.target.value)}
            className="h-9 text-xs font-semibold px-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
          >
            <option value="Todos">Todos los Tutores</option>
            {uniqueMentors.map((mentor) => (
              <option key={mentor} value={mentor}>
                {mentor}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Students Table / Consistencia y Progreso */}
      {students.length === 0 ? (
        <div className="p-8 text-center text-sm font-medium text-slate-500 bg-white rounded-xl border border-slate-200">
          No hay alumnos registrados en el sistema.
        </div>
      ) : processedStudents.length === 0 ? (
        <div className="p-8 text-center text-sm font-medium text-slate-500 bg-white rounded-xl border border-slate-200">
          No se encontraron alumnos con los criterios de búsqueda especificados.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3.5 text-center w-10">#</th>
                <th scope="col" className="px-4 py-3.5">Estudiante</th>
                <th scope="col" className="px-4 py-3.5">Curso</th>
                <th scope="col" className="px-4 py-3.5 hidden md:table-cell">Materia</th>
                <th scope="col" className="px-4 py-3.5">Tutor Asignado</th>
                <th scope="col" className="px-4 py-3.5 text-right">Diagnóstico Base</th>
                <th scope="col" className="px-4 py-3.5 text-right">Último Quiz</th>
                <th scope="col" className="px-4 py-3.5 text-right">Evolución ($\Delta$)</th>
                <th scope="col" className="px-4 py-3.5">Estatus de Progreso</th>
                <th scope="col" className="px-4 py-3.5 text-center">Curva</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
              {processedStudents.map((student, index) => {
                const { evalCount, lastQuizGrade, notaInicial, delta } = getStudentMetrics(student)
                const isExpanded = expandedStudentId === student.id
                const evals = evaluationsMap.get(student.id) || []

                return (
                  <React.Fragment key={student.id}>
                    <tr className={`hover:bg-slate-50/80 transition-colors ${isExpanded ? 'bg-slate-50/60' : ''}`}>
                      <td className="px-4 py-3.5 text-center font-mono font-medium text-slate-400">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-900 whitespace-nowrap">
                        {student.fullName}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="rounded-md bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 text-[10px] font-medium">
                          {student.grade}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap hidden md:table-cell text-slate-600">
                        {student.subject}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                        {student.mentorName || '—'}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-right whitespace-nowrap text-slate-900">
                        {Number.isFinite(notaInicial) ? notaInicial : '—'}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-right whitespace-nowrap">
                        {lastQuizGrade !== null && Number.isFinite(lastQuizGrade) ? (
                          <span className="font-bold text-slate-900">{lastQuizGrade}</span>
                        ) : (
                          <span className="text-slate-400 italic">Pendiente</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        {renderDeltaBadge(delta)}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {renderStatusBadge(delta, evalCount)}
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setExpandedStudentId(isExpanded ? null : student.id)}
                          className="inline-flex items-center gap-1 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all cursor-pointer shadow-2xs"
                          title="Ver historial de evaluaciones"
                        >
                          <span>Curva ({evalCount})</span>
                          {isExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Read-Only Timeline */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={10} className="p-0">
                          <div className="bg-slate-50/90 border-y border-slate-200 p-6 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                              <div className="flex items-center gap-2">
                                <Sparkles className="size-4 text-indigo-600" />
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                  Historial Inmutable de Evaluaciones · {student.fullName}
                                </h4>
                              </div>
                              <span className="text-[11px] text-slate-500 font-medium">
                                Tutor asignado: {student.mentorName || 'Tutor PRAM'}
                              </span>
                            </div>

                            <StudentEvalTimeline
                              notaInicial={student.notaInicial}
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
    </div>
  )
}


