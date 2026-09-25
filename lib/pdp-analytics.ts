// lib/pdp-analytics.ts
// PRAM OS — Motor de Analítica y Prescripción Pedagógica (PDP v1.0)
// Demarcación: Liceo Minerva Mirabal · Distrito Educativo 10-04

import { Evaluacion, StudentData } from '@/lib/firebase-service'
import { CausaRaizPDP, SubtipoError } from '@/types/pram'

export const DRIVE_REPOSITORY_URL =
  'https://drive.google.com/drive/folders/1rcQrX6BB6LYM647_3VZ71akE0lFFf6IB?usp=sharing'

export interface PdpPrescription {
  subtipo: SubtipoError
  materia: 'Matemáticas' | 'Lengua Española'
  causaRaiz: CausaRaizPDP
  tecnicaObligatoria: string
  instruccionMentor: string
  guiaDriveNombre: string
  enlaceDrive: string
}

/** Catálogo oficial de prescripciones pedagógicas PRAM OS */
export const PDP_PRESCRIPTIONS: Record<string, PdpPrescription> = {
  // Matemáticas
  'Signo / Operación Inversa': {
    subtipo: 'Signo / Operación Inversa',
    materia: 'Matemáticas',
    causaRaiz: 'Procedimental',
    tecnicaObligatoria: 'Fase Pictórica del Método Singapur (Barras de Transposición)',
    instruccionMentor:
      'Prohibido el despeje puramente algebraico. Dibujar las barras de balance simétrico en la hoja F-PRAM-01 antes de escribir la ecuación simbólica.',
    guiaDriveNombre: 'Guia-Refuerzo-MAT-Signos-Inversas.pdf',
    enlaceDrive: DRIVE_REPOSITORY_URL,
  },
  'Orden de Operaciones': {
    subtipo: 'Orden de Operaciones',
    materia: 'Matemáticas',
    causaRaiz: 'Procedimental',
    tecnicaObligatoria: 'Regla Estricta PEMDAS / Embudo Jerárquico',
    instruccionMentor:
      'Hacer que el estudiante subraye y resuelva una sola jerarquía por renglón en forma de pirámide invertida.',
    guiaDriveNombre: 'Guia-Refuerzo-MAT-Jerarquia-Operaciones.pdf',
    enlaceDrive: DRIVE_REPOSITORY_URL,
  },
  'Confusión de Variable': {
    subtipo: 'Confusión de Variable',
    materia: 'Matemáticas',
    causaRaiz: 'Conceptual',
    tecnicaObligatoria: 'Cajas de Incógnita / Concretización CPA',
    instruccionMentor:
      'Sustituir las letras algebraicas (x, y) por cajas físicas o rectángulos dibujados antes de pasar a la abstracción.',
    guiaDriveNombre: 'Guia-Refuerzo-MAT-Variables-Concepto.pdf',
    enlaceDrive: DRIVE_REPOSITORY_URL,
  },
  'Transferencia Incorrecta de Regla': {
    subtipo: 'Transferencia Incorrecta de Regla',
    materia: 'Matemáticas',
    causaRaiz: 'Conceptual',
    tecnicaObligatoria: 'Contraejemplos Socráticos de 90 Segundos',
    instruccionMentor:
      'Presentar un caso numérico evidente donde la regla inventada falle (ej: (a+b)² ≠ a²+b² con números 1 y 2).',
    guiaDriveNombre: 'Guia-Refuerzo-MAT-Contraejemplos.pdf',
    enlaceDrive: DRIVE_REPOSITORY_URL,
  },
  'Falta de Validación del Resultado': {
    subtipo: 'Falta de Validación del Resultado',
    materia: 'Matemáticas',
    causaRaiz: 'Atención',
    tecnicaObligatoria: 'Protocolo de Verificación Reversa',
    instruccionMentor:
      'El ejercicio no se da por concluido hasta que el alumno reemplace el valor obtenido en la ecuación original.',
    guiaDriveNombre: 'Guia-Refuerzo-MAT-Verificacion-Reversa.pdf',
    enlaceDrive: DRIVE_REPOSITORY_URL,
  },
  'Error Mecánico de Cálculo': {
    subtipo: 'Error Mecánico de Cálculo',
    materia: 'Matemáticas',
    causaRaiz: 'Atención',
    tecnicaObligatoria: 'Cálculo Mental en Bloques de 3 Minutos',
    instruccionMentor:
      'Realizar ronda relámpago de operaciones aritméticas básicas al inicio de la sesión para calentar agilidad mental.',
    guiaDriveNombre: 'Guia-Refuerzo-MAT-Calculo-Mecanico.pdf',
    enlaceDrive: DRIVE_REPOSITORY_URL,
  },

  // Lengua Española
  'Salto de palabras': {
    subtipo: 'Salto de palabras',
    materia: 'Lengua Española',
    causaRaiz: 'Atención',
    tecnicaObligatoria: 'Lectura con Guía Dactilar / Regla Guía',
    instruccionMentor:
      'El alumno debe apoyar un bolígrafo o dedo sobre cada palabra mientras lee en voz alta antes de responder la consigna.',
    guiaDriveNombre: 'Guia-Refuerzo-LEN-Lectura-Guiada.pdf',
    enlaceDrive: DRIVE_REPOSITORY_URL,
  },
  'Inversión de relación': {
    subtipo: 'Inversión de relación',
    materia: 'Lengua Española',
    causaRaiz: 'Conceptual',
    tecnicaObligatoria: 'Diagramación Flecha Causa-Efecto',
    instruccionMentor:
      'Hacer que dibuje qué evento ocurrió primero temporalmente mediante flechas antes de interpretar la consecuencia del texto.',
    guiaDriveNombre: 'Guia-Refuerzo-LEN-Causa-Efecto.pdf',
    enlaceDrive: DRIVE_REPOSITORY_URL,
  },
  'Sujeto-objeto confuso': {
    subtipo: 'Sujeto-objeto confuso',
    materia: 'Lengua Española',
    causaRaiz: 'Procedimental',
    tecnicaObligatoria: 'Identificación de Agente y Paciente con Código de Colores',
    instruccionMentor:
      'Subrayar en azul quién ejecuta la acción y en naranja quién la recibe antes de redactar la respuesta.',
    guiaDriveNombre: 'Guia-Refuerzo-LEN-Estructura-Oracion.pdf',
    enlaceDrive: DRIVE_REPOSITORY_URL,
  },
  'Pérdida de matiz / contexto': {
    subtipo: 'Pérdida de matiz / contexto',
    materia: 'Lengua Española',
    causaRaiz: 'Estratégico',
    tecnicaObligatoria: 'Análisis de Conectores Lógicos y Tono',
    instruccionMentor:
      'Pedir al alumno que identifique conectores adversativos (pero, sin embargo, aunque) y defina el cambio de sentido del autor.',
    guiaDriveNombre: 'Guia-Refuerzo-LEN-Conectores-Contexto.pdf',
    enlaceDrive: DRIVE_REPOSITORY_URL,
  },
}

export interface StudentPdpAlert {
  isStagnant: boolean
  repeatedSubtype?: string
  consecutiveFailsCount: number
  lastDiagnoses: Array<{
    fecha: string
    subtipo: string
    causaRaiz?: string
    calificacion: number
  }>
  prescription?: PdpPrescription
}

export function analyzeStudentPdpAlert(evaluaciones: Evaluacion[]): StudentPdpAlert {
  if (!evaluaciones || evaluaciones.length === 0) {
    return { isStagnant: false, consecutiveFailsCount: 0, lastDiagnoses: [] }
  }

  const sorted = [...evaluaciones].sort((a, b) => (a.fecha || '').localeCompare(b.fecha || ''))
  const pdpEvals = sorted.filter((e) => Boolean(e.subtipoError))

  const lastDiagnoses = pdpEvals.slice(-3).map((e) => ({
    fecha: e.fecha,
    subtipo: e.subtipoError || '',
    causaRaiz: e.causaRaizPDP,
    calificacion: e.calificacion,
  }))

  if (pdpEvals.length < 2) {
    return {
      isStagnant: false,
      consecutiveFailsCount: pdpEvals.length,
      lastDiagnoses,
      prescription: pdpEvals.length === 1 ? PDP_PRESCRIPTIONS[pdpEvals[0].subtipoError || ''] : undefined,
    }
  }

  const last = pdpEvals[pdpEvals.length - 1]
  const secondLast = pdpEvals[pdpEvals.length - 2]

  const isStagnant =
    Boolean(last.subtipoError) &&
    last.subtipoError === secondLast.subtipoError

  const prescription = last.subtipoError ? PDP_PRESCRIPTIONS[last.subtipoError] : undefined

  return {
    isStagnant,
    repeatedSubtype: isStagnant ? last.subtipoError : undefined,
    consecutiveFailsCount: isStagnant ? 2 : 1,
    lastDiagnoses,
    prescription,
  }
}

export interface ClassroomAlert {
  grade: string
  subject: 'Matemáticas' | 'Lengua Española'
  subtipoError: string
  causaRaiz?: CausaRaizPDP
  affectedStudentsCount: number
  totalEvaluatedStudents: number
  percentage: number
  prescription?: PdpPrescription
}

export function analyzeClassroomPdpAlerts(
  students: StudentData[],
  evaluationsMap: Map<string, Evaluacion[]>
): ClassroomAlert[] {
  const alerts: ClassroomAlert[] = []
  const groups = new Map<string, StudentData[]>()

  students.forEach((s) => {
    const key = `${s.grade}__${s.subject}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(s)
  })

  groups.forEach((groupStudents, key) => {
    const [grade, subject] = key.split('__') as [string, 'Matemáticas' | 'Lengua Española']

    const subtypeCount = new Map<string, number>()
    let evaluatedStudentsWithPdp = 0

    groupStudents.forEach((student) => {
      const evals = evaluationsMap.get(student.id) || []
      const pdpEvals = evals.filter((e) => Boolean(e.subtipoError))
      if (pdpEvals.length > 0) {
        evaluatedStudentsWithPdp += 1
        const latest = pdpEvals[pdpEvals.length - 1]
        if (latest.subtipoError) {
          subtypeCount.set(latest.subtipoError, (subtypeCount.get(latest.subtipoError) || 0) + 1)
        }
      }
    })

    if (evaluatedStudentsWithPdp < 2) return

    subtypeCount.forEach((count, subtipo) => {
      const percentage = Math.round((count / evaluatedStudentsWithPdp) * 100)
      if (percentage >= 30) {
        alerts.push({
          grade,
          subject,
          subtipoError: subtipo,
          affectedStudentsCount: count,
          totalEvaluatedStudents: evaluatedStudentsWithPdp,
          percentage,
          prescription: PDP_PRESCRIPTIONS[subtipo],
        })
      }
    })
  })

  return alerts.sort((a, b) => b.percentage - a.percentage)
}

export interface BrokenNodeSummary {
  subtipo: string
  causaRaiz: string
  materia: string
  count: number
  percentage: number
  studentsCount: number
}

export function getBreakdownNodosRotos(
  students: StudentData[],
  evaluationsMap: Map<string, Evaluacion[]>,
  selectedGrade = 'Todos',
  selectedSubject = 'Todas'
): {
  ranking: BrokenNodeSummary[]
  totalPdpErrors: number
  totalStudentsAudited: number
} {
  const filteredStudents = students.filter((s) => {
    if (selectedGrade !== 'Todos' && s.grade !== selectedGrade) return false
    if (selectedSubject !== 'Todas' && s.subject !== selectedSubject) return false
    return true
  })

  const counts = new Map<string, { count: number; students: Set<string>; causaRaiz: string; materia: string }>()
  let totalPdpErrors = 0
  const auditedStudentIds = new Set<string>()

  filteredStudents.forEach((student) => {
    const evals = evaluationsMap.get(student.id) || []
    evals.forEach((e) => {
      if (e.subtipoError) {
        totalPdpErrors += 1
        auditedStudentIds.add(student.id)
        const sub = e.subtipoError
        if (!counts.has(sub)) {
          counts.set(sub, {
            count: 0,
            students: new Set(),
            causaRaiz: e.causaRaizPDP || 'Procedimental',
            materia: student.subject,
          })
        }
        const item = counts.get(sub)!
        item.count += 1
        item.students.add(student.id)
      }
    })
  })

  const ranking: BrokenNodeSummary[] = Array.from(counts.entries())
    .map(([subtipo, data]) => ({
      subtipo,
      causaRaiz: data.causaRaiz,
      materia: data.materia,
      count: data.count,
      studentsCount: data.students.size,
      percentage: totalPdpErrors > 0 ? Math.round((data.count / totalPdpErrors) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)

  return {
    ranking,
    totalPdpErrors,
    totalStudentsAudited: auditedStudentIds.size,
  }
}
