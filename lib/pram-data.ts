export type Role = 'estudiante' | 'mentor' | 'director'

export type HistoryStatus = 'completado' | 'pendiente'

export type HistoryItem = {
  id: string
  topic: string
  date: string
  status: HistoryStatus
}

export const session = {
  dateLabel: '14 ago 2026 · 3:30 PM',
  title: 'Resolución de Ecuaciones Lineales con Una Incógnita',
  mentorNote:
    'Repasaremos el despeje de variables y practicaremos con 5 ejercicios guiados. Trae tu cuaderno de la sesión anterior.',
  mentor: 'Prof. Altagracia Peña',
  subject: 'Matemáticas',
  pin: '1234',
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
  current: 3.7,
  scale: 5,
  delta: 0.6,
  levelName: 'Funcional',
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

export const history: HistoryItem[] = [
  {
    id: '1',
    topic: 'Operaciones con Fracciones',
    date: '7 ago 2026',
    status: 'completado',
  },
  {
    id: '2',
    topic: 'Razones y Proporciones',
    date: '31 jul 2026',
    status: 'completado',
  },
  {
    id: '3',
    topic: 'Introducción al Álgebra',
    date: '24 jul 2026',
    status: 'completado',
  },
  {
    id: '4',
    topic: 'Evaluación Diagnóstica de Cierre',
    date: '21 ago 2026',
    status: 'pendiente',
  },
]

export const microRoutes = [
  { id: 'm1', title: 'Despeje de variables', minutes: 8, done: true },
  { id: 'm2', title: 'Ecuaciones con paréntesis', minutes: 12, done: false },
  { id: 'm3', title: 'Problemas de aplicación', minutes: 15, done: false },
]

export const student = {
  name: 'Carlos',
  fullName: 'Carlos Reyes',
  pin: '1234',
  cohort: 'Grupo 8B',
}
