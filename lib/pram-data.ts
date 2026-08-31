export type Role = 'estudiante' | 'mentor' | 'director'

export type HistoryStatus = 'completado' | 'pendiente'

export type HistoryItem = {
  id: string
  topic: string
  date: string
  status: HistoryStatus
}

export const session = {
  dateLabel: 'Sin sesiones programadas',
  title: 'Refuerzo Académico',
  mentorNote: 'Registra la primera sesión en el Panel del Tutor.',
  mentor: 'Docente / Tutor PRAM',
  subject: 'Matemáticas',
  pin: '----',
}

export const levelRubric = [
  { value: 1, name: 'Crítico' },
  { value: 2, name: 'Básico' },
  { value: 3, name: 'Funcional' },
  { value: 4, name: 'Sólido' },
  { value: 5, name: 'Avanzado' },
] as const

export const level = {
  label: 'Nivel Académico',
  current: 0,
  scale: 5,
  delta: 0,
  levelName: 'En Diagnóstico',
}

export type MentorRank = 'Junior' | 'Senior' | 'Director de Área'

export const mentorRanks: { rank: MentorRank; description: string }[] = [
  { rank: 'Junior', description: 'Enseña y opera bajo supervisión.' },
  { rank: 'Senior', description: 'Diseña materiales y evalúa pruebas.' },
  {
    rank: 'Director de Área',
    description:
      'Administra cohortes y accede a la carta de recomendación institucional.',
  },
]

export const history: HistoryItem[] = []

export const microRoutes = [
  { id: 'm1', title: 'Despeje de variables', minutes: 8, done: false },
  { id: 'm2', title: 'Ecuaciones con paréntesis', minutes: 12, done: false },
  { id: 'm3', title: 'Problemas de aplicación', minutes: 15, done: false },
]

export const student = {
  name: 'Estudiante',
  fullName: 'Estudiante PRAM',
  pin: '----',
  cohort: 'Cohorte 2026-2',
}
