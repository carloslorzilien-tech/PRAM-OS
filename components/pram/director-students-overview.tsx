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
  Microscope,
  AlertTriangle,
  FileText,
  Printer,
  X,
  Copy,
  Check,
  FolderOpen,
} from 'lucide-react'
import { StudentEvalTimeline } from '@/components/pram/student-eval-timeline'
import {
  analyzeClassroomPdpAlerts,
  getBreakdownNodosRotos,
  PDP_PRESCRIPTIONS,
  DRIVE_REPOSITORY_URL,
} from '@/lib/pdp-analytics'

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

  // PDP Broken Nodes & Teacher Report Modal state
  const [showNodosRotos, setShowNodosRotos] = useState<boolean>(true)
  const [reportModalData, setReportModalData] = useState<{
    grade: string
    subject: string
    subtipo: string
    affectedCount: number
    percentage: number
    causaRaiz?: string
    tecnica: string
    instruccion: string
  } | null>(null)
  const [copiedReport, setCopiedReport] = useState(false)

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

  // PDP Analytics Memos
  const classroomAlerts = useMemo(
    () => analyzeClassroomPdpAlerts(students, evaluationsMap),
    [students, evaluationsMap]
  )

  const brokenNodes = useMemo(
    () => getBreakdownNodosRotos(students, evaluationsMap, selectedGrade, selectedSubject),
    [students, evaluationsMap, selectedGrade, selectedSubject]
  )

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

      {/* 2. Alertas Curriculares de Sección (>30% de concentración en un nodo) */}
      {classroomAlerts.length > 0 && (
        <div className="space-y-3">
          {classroomAlerts.map((alert, idx) => (
            <div
              key={`alert-${idx}`}
              className="rounded-xl border border-amber-300 bg-amber-50/90 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded bg-amber-200/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900">
                    <AlertTriangle className="size-3.5 text-amber-800" />
                    Punto Ciego de Aula Detectado
                  </span>
                  <span className="text-xs font-bold text-amber-950">
                    {alert.grade} · {alert.subject}
                  </span>
                </div>
                <p className="text-xs text-amber-950 font-medium leading-relaxed">
                  Concentración del <strong>{alert.percentage}%</strong> en{' '}
                  <strong className="underline decoration-amber-400 font-bold">{alert.subtipoError}</strong> ({alert.affectedStudentsCount} de {alert.totalEvaluatedStudents} alumnos auditados).
                </p>
              </div>
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setReportModalData({
                      grade: alert.grade,
                      subject: alert.subject,
                      subtipo: alert.subtipoError,
                      affectedCount: alert.affectedStudentsCount,
                      percentage: alert.percentage,
                      causaRaiz: alert.causaRaiz,
                      tecnica: alert.prescription?.tecnicaObligatoria || 'Método Singapur / Refuerzo Focalizado',
                      instruccion: alert.prescription?.instruccionMentor || 'Repaso de 10 minutos al inicio de la próxima clase ordinaria.',
                    })
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-900 text-white hover:bg-amber-800 px-3.5 py-2 text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <FileText className="size-3.5" />
                  <span>Emitir Nota al Docente Titular</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Mapa de Nodos Rotos (Analítica Colectiva PDP) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-xs">
              <Microscope className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Mapa de Nodos Rotos (Analítica Colectiva PDP)
              </h3>
              <p className="text-xs text-slate-500">
                Frecuencia de fallos específicos para intervención preventiva antes de pruebas oficiales del MINERD.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md">
              {brokenNodes.totalPdpErrors} fallos auditados ({brokenNodes.totalStudentsAudited} alumnos)
            </span>
            <button
              type="button"
              onClick={() => setShowNodosRotos((v) => !v)}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 p-1.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
              title={showNodosRotos ? 'Ocultar mapa' : 'Mostrar mapa'}
            >
              {showNodosRotos ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
          </div>
        </div>

        {showNodosRotos && (
          <div>
            {brokenNodes.ranking.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-slate-100">
                No hay diagnósticos PDP registrados para el filtro actual. Aplica evaluaciones con subtipo de error para alimentar el mapa.
              </div>
            ) : (
              <div className="space-y-2.5">
                {brokenNodes.ranking.slice(0, 5).map((node, i) => (
                  <div
                    key={node.subtipo}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-400 font-mono text-[11px]">
                          #{i + 1}
                        </span>
                        <span className="font-semibold text-slate-900">
                          {node.subtipo}
                        </span>
                        <span className="rounded bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 border border-slate-200">
                          {node.materia}
                        </span>
                        <span className="rounded bg-indigo-50 text-indigo-700 text-[10px] font-medium px-2 py-0.5 border border-indigo-200">
                          {node.causaRaiz}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">
                          {node.percentage}% de fallos
                        </span>
                        <span className="text-[11px] text-slate-400">
                          ({node.studentsCount} alumno{node.studentsCount !== 1 ? 's' : ''})
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const prescription = PDP_PRESCRIPTIONS[node.subtipo]
                            setReportModalData({
                              grade: selectedGrade === 'Todos' ? 'Secciones de 3ro y 4to' : selectedGrade,
                              subject: node.materia,
                              subtipo: node.subtipo,
                              affectedCount: node.studentsCount,
                              percentage: node.percentage,
                              causaRaiz: node.causaRaiz,
                              tecnica: prescription?.tecnicaObligatoria || 'Método Singapur / Refuerzo Focalizado',
                              instruccion: prescription?.instruccionMentor || 'Repaso de 10 minutos al inicio de la próxima clase ordinaria.',
                            })
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 px-2 py-1 rounded transition-colors cursor-pointer"
                          title="Generar nota para el profesor titular del liceo"
                        >
                          <FileText className="size-3 text-slate-500" />
                          <span>Nota Docente</span>
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-slate-900 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(10, node.percentage))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Controls & Filter Bar */}
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

      {/* 5. Modal: Nota Preventiva al Profesor Titular del Liceo Minerva Mirabal */}
      {reportModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4 py-6 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg p-6 space-y-5 relative my-auto">
            {/* Cerrar */}
            <button
              type="button"
              onClick={() => {
                setReportModalData(null)
                setCopiedReport(false)
              }}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="size-5" />
            </button>

            {/* Encabezado Institucional */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs shrink-0">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0 pr-6">
                <h3 className="text-sm font-bold tracking-tight text-slate-900">
                  Nota Preventiva de Aula (F-PRAM-NP)
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Liceo Minerva Mirabal · Distrito Educativo 10-04
                </p>
              </div>
            </div>

            {/* Contenido del Micro-Reporte */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs text-slate-700">
              <div className="border-b border-slate-200/80 pb-2 space-y-0.5 text-[11px] font-mono">
                <p><strong>DESTINATARIO:</strong> Docente Titular de {reportModalData.subject}</p>
                <p><strong>SECCIÓN / CURSO:</strong> {reportModalData.grade}</p>
                <p><strong>ORIGEN:</strong> Auditoría de Refuerzo Académico PRAM OS</p>
                <p><strong>FECHA:</strong> {new Date().toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>

              <div className="space-y-1.5 font-sans">
                <p className="font-semibold text-slate-900 text-xs">
                  DIAGNÓSTICO CLÍNICO COLECTIVO:
                </p>
                <p className="text-slate-700 text-xs leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                  "La analítica de PRAM OS ha detectado una concentración del <strong>{reportModalData.percentage}%</strong> de fallos en el nodo crítico <strong>[{reportModalData.subtipo}]</strong> ({reportModalData.causaRaiz || 'Procedimental'}) en <strong>{reportModalData.affectedCount}</strong> estudiantes de <strong>{reportModalData.grade}</strong>."
                </p>
              </div>

              <div className="space-y-1.5 font-sans">
                <p className="font-semibold text-slate-900 text-xs">
                  INTERVENCIÓN PREVENTIVA SUGERIDA (10 MINUTOS DE AULA):
                </p>
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs text-slate-700">
                  <p>
                    <strong>Técnica:</strong> {reportModalData.tecnica}
                  </p>
                  <p className="text-slate-600 leading-normal">
                    {reportModalData.instruccion}
                  </p>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <a
                href={DRIVE_REPOSITORY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                <FolderOpen className="size-4" />
                <span>Ver Carpeta en Drive</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const text = `MINERD · DISTRITO 10-04 · LICEO MINERVA MIRABAL\nNOTA PREVENTIVA PRAM OS (F-PRAM-NP)\nPara: Docente Titular de ${reportModalData.subject} (${reportModalData.grade})\nFecha: ${new Date().toLocaleDateString('es-DO')}\n\nDIAGNÓSTICO:\nLa analítica de PRAM OS detectó que el ${reportModalData.percentage}% de los estudiantes auditados presentan bloqueo en [${reportModalData.subtipo}] (${reportModalData.causaRaiz || 'Procedimental'}).\n\nINTERVENCIÓN SUGERIDA DE AULA (10 MIN):\nTécnica: ${reportModalData.tecnica}\nInstrucción: ${reportModalData.instruccion}\n\nEvidencias y Guías en Drive: ${DRIVE_REPOSITORY_URL}`

                    navigator.clipboard.writeText(text)
                    setCopiedReport(true)
                    setTimeout(() => setCopiedReport(false), 3000)
                  }}
                  className="inline-flex items-center gap-1.5 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg px-3 py-2 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                >
                  {copiedReport ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5 text-slate-500" />}
                  <span>{copiedReport ? 'Copiado' : 'Copiar Texto'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg px-3.5 py-2 text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <Printer className="size-3.5" />
                  <span>Imprimir Nota</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


