// lib/db.ts
// PRAM OS — Mock Data Layer (Fase 1: Preparación para Google Firebase)

export type MateriaValida = 'Matemáticas' | 'Lengua Española'

export interface Usuario {
  id: string
  email: string
  nombre: string
  rol: 'DIRECTOR' | 'AREA_DIRECTOR' | 'MENTOR' | 'STUDENT'
  grado?: string | null
  area?: MateriaValida | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  created_at?: string
}

export interface Mentor {
  id: string
  nombre: string
  email: string
  rango: 'Junior' | 'Senior' | 'Head' | string
  horas_acumuladas: number
  meta_horas: number
  especialidad: MateriaValida | string
  telefono?: string
  created_at?: string
}

export interface Sesion {
  id: string
  mentor_id: string
  mentor_nombre?: string
  materia: MateriaValida
  tema: string
  duracion_minutos: number
  cantidad_alumnos: number
  fecha_sesion: string
  notas?: string | null
  estado: 'pending' | 'approved' | 'rejected'
  aprobado_por?: string | null
  fecha_aprobacion?: string | null
  cuv?: string | null
  created_at?: string
}

export interface PublicKPIs {
  horasCertificadas: number
  estudiantesAtendidos: number
  sesionesValidadas: number
  tasaAsistencia: number
}

export interface CertificadoCUV {
  id: string
  cuv_codigo: string
  mentor_nombre: string
  horas_certificadas: number
  liceo: string
  fecha_emision: string
  entidad_emisora: string
  estado: 'valid' | 'invalid'
}

// In-Memory Store (Zero State Baseline)
let mockUsuarios: Usuario[] = [
  {
    id: 'u-carlos-dir',
    email: 'carlos.lorzilien@gmail.com',
    nombre: 'Carlos Lorzilien (Director)',
    rol: 'DIRECTOR',
    status: 'APPROVED',
  },
]

let mockMentores: Mentor[] = []
let mockSesiones: Sesion[] = []
let mockCuvs: CertificadoCUV[] = []

export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1500): Promise<T> {
  return fn()
}

export async function getPublicKPIs(): Promise<PublicKPIs> {
  return {
    horasCertificadas: 0,
    estudiantesAtendidos: 0,
    sesionesValidadas: 0,
    tasaAsistencia: 100,
  }
}

export async function getTopMentores(limit?: number): Promise<Mentor[]> {
  const sorted = [...mockMentores].sort((a, b) => b.horas_acumuladas - a.horas_acumuladas)
  return limit !== undefined ? sorted.slice(0, limit) : sorted
}

export async function getSessionById(sessionId: string): Promise<Sesion | null> {
  return mockSesiones.find((s) => s.id === sessionId) || null
}

export async function getMentorSessions(mentorId: string): Promise<{ mentor: Mentor | null; sesiones: Sesion[] }> {
  const mentor = mockMentores.find((m) => m.id === mentorId) || mockMentores[0] || null
  const sesiones = mockSesiones.filter((s) => s.mentor_id === mentorId)
  return { mentor, sesiones }
}

export async function getPendingSessionsForAudit(): Promise<Sesion[]> {
  return mockSesiones.filter((s) => s.estado === 'pending')
}

export async function getPendingUsers(): Promise<Usuario[]> {
  return mockUsuarios.filter((u) => u.status === 'PENDING')
}

export async function getUserByEmail(email: string): Promise<Usuario | null> {
  const clean = email.toLowerCase().trim()
  return mockUsuarios.find((u) => u.email.toLowerCase() === clean) || null
}

export async function registerPendingUser(data: {
  email: string
  nombre: string
  rol: 'MENTOR' | 'STUDENT'
  grado?: string
  area?: MateriaValida
}): Promise<Usuario> {
  const newUser: Usuario = {
    id: `usr-${Date.now()}`,
    email: data.email,
    nombre: data.nombre,
    rol: data.rol,
    grado: data.grado,
    area: data.area,
    status: 'PENDING',
  }
  mockUsuarios.push(newUser)
  return newUser
}

export async function createSessionInDb(data: {
  mentor_id: string
  materia: MateriaValida
  tema: string
  duracion_minutos: number
  cantidad_alumnos: number
  fecha_sesion: string
  notas?: string
}): Promise<Sesion> {
  const newSession: Sesion = {
    id: `ses-${Date.now()}`,
    mentor_id: data.mentor_id,
    mentor_nombre: 'Prof. Carlos Omar Lorzilien',
    materia: data.materia,
    tema: data.tema,
    duracion_minutos: data.duracion_minutos,
    cantidad_alumnos: data.cantidad_alumnos,
    fecha_sesion: data.fecha_sesion,
    notas: data.notas,
    estado: 'pending',
  }
  mockSesiones.unshift(newSession)
  return newSession
}

export async function approveSessionInDb(sessionId: string, supervisorName = 'Dirección del Liceo Minerva Mirabal'): Promise<Sesion | null> {
  const session = mockSesiones.find((s) => s.id === sessionId)
  if (session) {
    session.estado = 'approved'
    session.aprobado_por = supervisorName
    session.fecha_aprobacion = new Date().toISOString()
    session.cuv = `PRAM-2026-M${Math.floor(10 + Math.random() * 90)}-${Math.floor(1000 + Math.random() * 9000)}`
  }
  return session || null
}

export async function rejectSessionInDb(sessionId: string): Promise<Sesion | null> {
  const session = mockSesiones.find((s) => s.id === sessionId)
  if (session) {
    session.estado = 'rejected'
  }
  return session || null
}

export async function approveUserInDb(userId: string): Promise<Usuario | null> {
  const user = mockUsuarios.find((u) => u.id === userId)
  if (user) {
    user.status = 'APPROVED'
  }
  return user || null
}

export async function rejectUserInDb(userId: string): Promise<Usuario | null> {
  const user = mockUsuarios.find((u) => u.id === userId)
  if (user) {
    user.status = 'REJECTED'
  }
  return user || null
}

export async function getCUVDetails(cuvCode: string): Promise<CertificadoCUV | null> {
  return {
    id: 'cert-1',
    cuv_codigo: cuvCode,
    mentor_nombre: 'Prof. Carlos Omar Lorzilien',
    horas_certificadas: 60.0,
    liceo: 'Liceo Minerva Mirabal · PRAM OS',
    fecha_emision: '15 de Agosto de 2026',
    entidad_emisora: 'Ministerio de Educación (MINERD) · Liceo Minerva Mirabal',
    estado: 'valid',
  }
}

export async function checkUserAuthRedirect(email?: string | null): Promise<{
  action: 'DASHBOARD' | 'PENDING' | 'ONBOARDING'
  targetUrl: string
  user: Usuario | null
}> {
  if (!email) return { action: 'ONBOARDING', targetUrl: '/onboarding', user: null }
  const clean = email.toLowerCase().trim()
  if (clean === 'carlos.lorzilien@gmail.com') {
    return { action: 'DASHBOARD', targetUrl: '/dashboard/director', user: mockUsuarios[0] }
  }
  return { action: 'DASHBOARD', targetUrl: '/dashboard/mentor', user: mockUsuarios[1] }
}
