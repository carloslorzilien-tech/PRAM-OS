import { supabase } from './client'
import {
  Estudiante,
  Mentor,
  Sesion,
  ExamenDiagnostico,
  Supervisor,
  SolicitudRefuerzo,
} from '@/types/pram'
import {
  mockEstudiantes,
  mockMentores,
  mockSesiones,
  mockSupervisores,
  mockSolicitudes,
  mockExamenes,
} from '@/lib/mockData'

const isOffline =
  process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true' ||
  typeof navigator !== 'undefined' && !navigator.onLine

function isValidUUID(str?: string): boolean {
  if (!str) return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export const SupabaseService = {
  // ==========================================
  // SUPERVISORES
  // ==========================================
  async getSupervisores(): Promise<Supervisor[]> {
    if (isOffline || !supabase) return mockSupervisores
    try {
      const { data, error } = await supabase.from('supervisores').select('*')
      if (error || !data || data.length === 0) return mockSupervisores
      return data as Supervisor[]
    } catch {
      return mockSupervisores
    }
  },

  // ==========================================
  // CRUD ESTUDIANTES
  // ==========================================
  async getEstudiantes(): Promise<Estudiante[]> {
    if (isOffline || !supabase) return mockEstudiantes
    try {
      const { data, error } = await supabase
        .from('estudiantes')
        .select('*')
        .order('nombre', { ascending: true })

      if (error || !data || data.length === 0) return mockEstudiantes
      return data as Estudiante[]
    } catch {
      return mockEstudiantes
    }
  },

  async createEstudiante(estudiante: Partial<Estudiante>): Promise<Estudiante | null> {
    if (isOffline || !supabase) return { ...(estudiante as Estudiante) }
    try {
      const payload = { ...estudiante }
      if (!isValidUUID(payload.id)) {
        payload.id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined
      }

      const { data, error } = await supabase
        .from('estudiantes')
        .insert([payload])
        .select()
        .single()

      if (error) return { ...(estudiante as Estudiante) }
      return data as Estudiante
    } catch {
      return { ...(estudiante as Estudiante) }
    }
  },

  async updateEstudiante(id: string, updates: Partial<Estudiante>): Promise<boolean> {
    if (isOffline || !supabase || !isValidUUID(id)) return true
    try {
      const { error } = await supabase
        .from('estudiantes')
        .update(updates)
        .eq('id', id)
      return !error
    } catch {
      return true
    }
  },

  async deleteEstudiante(id: string): Promise<boolean> {
    if (isOffline || !supabase || !isValidUUID(id)) return true
    try {
      const { error } = await supabase
        .from('estudiantes')
        .delete()
        .eq('id', id)
      return !error
    } catch {
      return true
    }
  },

  // ==========================================
  // CRUD MENTORES
  // ==========================================
  async getMentores(): Promise<Mentor[]> {
    if (isOffline || !supabase) return mockMentores
    try {
      const { data, error } = await supabase
        .from('mentores')
        .select('*')
        .order('horas_acumuladas', { ascending: false })

      if (error || !data || data.length === 0) return mockMentores
      return data as Mentor[]
    } catch {
      return mockMentores
    }
  },

  async createMentor(mentor: Partial<Mentor>): Promise<Mentor | null> {
    if (isOffline || !supabase) return { ...(mentor as Mentor) }
    try {
      const payload = { ...mentor }
      if (!isValidUUID(payload.id)) {
        payload.id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined
      }

      const { data, error } = await supabase
        .from('mentores')
        .insert([payload])
        .select()
        .single()

      if (error) return { ...(mentor as Mentor) }
      return data as Mentor
    } catch {
      return { ...(mentor as Mentor) }
    }
  },

  async updateMentorHoras(mentorId: string, horasNuevas: number): Promise<boolean> {
    if (isOffline || !supabase || !isValidUUID(mentorId)) return true
    try {
      const { error } = await supabase
        .from('mentores')
        .update({ horas_acumuladas: horasNuevas })
        .eq('id', mentorId)
      return !error
    } catch {
      return true
    }
  },

  // ==========================================
  // CRUD SESIONES (Validación Dual & Auditoría)
  // ==========================================
  async getSesiones(): Promise<Sesion[]> {
    if (isOffline || !supabase) return mockSesiones
    try {
      const { data, error } = await supabase
        .from('sesiones')
        .select('*')
        .order('created_at', { ascending: false })

      if (error || !data || data.length === 0) return mockSesiones
      return data as Sesion[]
    } catch {
      return mockSesiones
    }
  },

  async createSesion(sesion: Partial<Sesion>): Promise<Sesion | null> {
    if (isOffline || !supabase) return { ...(sesion as Sesion) }
    try {
      const payload = { ...sesion }
      if (!isValidUUID(payload.id)) {
        payload.id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined
      }

      const { data, error } = await supabase
        .from('sesiones')
        .insert([payload])
        .select()
        .single()

      if (error) return { ...(sesion as Sesion) }
      return data as Sesion
    } catch {
      return { ...(sesion as Sesion) }
    }
  },

  async updateSesion(id: string, updates: Partial<Sesion>): Promise<boolean> {
    if (isOffline || !supabase || !isValidUUID(id)) return true
    try {
      const { error } = await supabase
        .from('sesiones')
        .update(updates)
        .eq('id', id)
      return !error
    } catch {
      return true
    }
  },

  // ==========================================
  // CRUD EXÁMENES DIAGNÓSTICOS (PHYGITAL)
  // ==========================================
  async getExamenes(): Promise<ExamenDiagnostico[]> {
    if (isOffline || !supabase) return mockExamenes
    try {
      const { data, error } = await supabase
        .from('examenes_diagnostico')
        .select('*')
        .order('created_at', { ascending: false })

      if (error || !data || data.length === 0) return mockExamenes
      return data as ExamenDiagnostico[]
    } catch {
      return mockExamenes
    }
  },

  async createExamen(examen: Partial<ExamenDiagnostico>): Promise<ExamenDiagnostico | null> {
    if (isOffline || !supabase) return { ...(examen as ExamenDiagnostico) }
    try {
      const payload = { ...examen }
      if (!isValidUUID(payload.id)) {
        payload.id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined
      }

      const { data, error } = await supabase
        .from('examenes_diagnostico')
        .insert([payload])
        .select()
        .single()

      if (error) return { ...(examen as ExamenDiagnostico) }
      return data as ExamenDiagnostico
    } catch {
      return { ...(examen as ExamenDiagnostico) }
    }
  },

  // ==========================================
  // SOLICITUDES DE REFUERZO
  // ==========================================
  async getSolicitudesRefuerzo(): Promise<SolicitudRefuerzo[]> {
    if (isOffline || !supabase) return mockSolicitudes
    try {
      const { data, error } = await supabase
        .from('solicitudes_refuerzo')
        .select('*')
        .order('created_at', { ascending: false })

      if (error || !data || data.length === 0) return mockSolicitudes
      return data as SolicitudRefuerzo[]
    } catch {
      return mockSolicitudes
    }
  },

  async createSolicitudRefuerzo(solicitud: Partial<SolicitudRefuerzo>): Promise<SolicitudRefuerzo | null> {
    if (isOffline || !supabase) return { ...(solicitud as SolicitudRefuerzo) }
    try {
      const payload = { ...solicitud }
      if (!isValidUUID(payload.id)) {
        payload.id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined
      }

      const { data, error } = await supabase
        .from('solicitudes_refuerzo')
        .insert([payload])
        .select()
        .single()

      if (error) return { ...(solicitud as SolicitudRefuerzo) }
      return data as SolicitudRefuerzo
    } catch {
      return { ...(solicitud as SolicitudRefuerzo) }
    }
  }
}
