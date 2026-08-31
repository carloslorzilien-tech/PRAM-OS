'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import {
  Estudiante,
  Mentor,
  Sesion,
  ExamenDiagnostico,
  Supervisor,
  SolicitudRefuerzo,
  MentorRankingItem,
  EstudianteRankingItem,
  NivelDominio,
  RangoEstudiante,
  VariantePrueba,
  TipoExamen,
  EstadoSesion,
  EstadoAuditoria,
  GradoSecundaria,
  MentorRango,
  UserRole,
  CurrentUser,
  Materia,
  AreaSupervision,
} from '@/types/pram'
import { SupabaseService } from './supabase/supabase-service'
import { supabase, isSupabaseConfigured } from './supabase/client'
import {
  mockEstudiantes,
  mockMentores,
  mockSesiones,
  mockSupervisores,
  mockSolicitudes,
  mockExamenes,
} from '@/lib/mockData'
import { showToast } from '@/components/pram/toast'

interface PramContextType {
  // RBAC User & Demo State
  currentUser: CurrentUser
  setCurrentUserRole: (role: UserRole) => void
  isDemoMode: boolean
  setIsDemoMode: (val: boolean) => void
  isGuestMode: boolean

  // Auth Methods
  signInWithGoogle: () => Promise<{ success: boolean; needsOnboarding?: boolean }>
  signOut: () => Promise<void>
  loginSimulado: (role: UserRole) => void
  completeProfile: (data: { nombre: string; role: 'estudiante' | 'mentor' }) => Promise<void>
  requireAuth: (actionLabel: string, action: () => void) => void
  authModalState: { isOpen: boolean; actionLabel: string }
  closeAuthModal: () => void

  // Relational Data
  mentores: Mentor[]
  estudiantes: Estudiante[]
  estudiantesVisibles: Estudiante[] // RBAC filtered list
  sesiones: Sesion[]
  sesionesVisibles: Sesion[] // RBAC filtered list
  examenes: ExamenDiagnostico[]
  supervisores: Supervisor[]
  solicitudes: SolicitudRefuerzo[]
  activeMentorId: string
  setActiveMentorId: (id: string) => void
  isCloudConnected: boolean
  isLoading: boolean
  connectionError: string | null

  // Registration & Onboarding (CRUD)
  registrarNuevoMentor: (data: {
    nombre: string
    rango: MentorRango
    especialidad: AreaSupervision
  }) => Promise<Mentor>
  registrarNuevoEstudiante: (data: {
    nombre: string
    pin: string
    grado: GradoSecundaria
    liceo_seccion: string
    mentor_id: string
  }) => Promise<Estudiante>
  eliminarEstudiante: (id: string) => Promise<boolean>
  crearNuevaSesion: (data: {
    estudiante_id: string
    mentor_id: string
    tema: string
    materia: Materia
    fecha_programada: string
    duracion_minutos: number
    notas: string
  }) => Promise<Sesion>

  // Nomadic Student Auth & Fast Confirmation
  verificarPinEstudiante: (pin: string) => Estudiante | null
  confirmarAsistenciaNomada: (sesionId: string, pin: string) => { success: boolean; message: string }
  confirmarAsistenciaEstudiante: (sesionId: string) => Promise<boolean>
  solicitarMicroRuta: (data: { estudiante_id: string; tema: string; materia: Materia }) => Promise<SolicitudRefuerzo>
  
  // Mentor Actions
  confirmarSesionPorMentor: (sesionId: string) => void
  cambiarEstadoSesion: (sesionId: string, estado: EstadoSesion) => void
  registrarExamenPhygital: (data: {
    estudiante_id: string
    tipo: TipoExamen
    variante: VariantePrueba
    resultado_nivel: NivelDominio
    ai_analysis_summary: string
    foto_url: string
    respuestas_detectadas: Record<string, string>
  }) => Promise<void>

  // Director / Supervisor Executive Power
  aprobarAuditoriaManual: (sesionId: string) => Promise<boolean>
  aprobarAuditoriaMasiva: (sesionIds: string[]) => Promise<boolean>
  rechazarAuditoria: (sesionId: string) => Promise<boolean>
  reasignarMentorEstudiante: (estudianteId: string, nuevoMentorId: string) => Promise<boolean>
  autorizarGraduacionPram: (estudianteId: string) => Promise<boolean>

  // Lookups & Analytics
  getEstudianteById: (id: string) => Estudiante | undefined
  getMentorById: (id: string) => Mentor | undefined
  getRankingMentores: () => MentorRankingItem[]
  getRankingEstudiantes: () => EstudianteRankingItem[]
  getSesionesPendientesAuditoria: () => Sesion[]
  getEstudiantesPorNivel: () => Record<number, number>
}

const PramContext = createContext<PramContextType | undefined>(undefined)

const DEFAULT_GUEST_USER: CurrentUser = {
  id: 'guest',
  email: '',
  nombre: 'Visitante',
  role: 'guest',
}

export function PramProvider({ children }: { children: React.ReactNode }) {
  // Demo Mode Switcher (Persistido en localStorage)
  const [isDemoMode, setIsDemoModeState] = useState<boolean>(true)

  // Current User RBAC State
  const [currentUser, setCurrentUser] = useState<CurrentUser>(DEFAULT_GUEST_USER)
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; actionLabel: string; pendingAction?: () => void }>({
    isOpen: false,
    actionLabel: '',
  })

  // Relational data
  const [mentores, setMentores] = useState<Mentor[]>(mockMentores)
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>(mockEstudiantes)
  const [sesiones, setSesiones] = useState<Sesion[]>(mockSesiones)
  const [examenes, setExamenes] = useState<ExamenDiagnostico[]>(mockExamenes)
  const [supervisores] = useState<Supervisor[]>(mockSupervisores)
  const [solicitudes, setSolicitudes] = useState<SolicitudRefuerzo[]>(mockSolicitudes)
  const [activeMentorId, setActiveMentorId] = useState<string>(mockMentores[0].id)
  const [isCloudConnected, setIsCloudConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Sincronización con localStorage al inicializar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDemo = localStorage.getItem('pram_demo_mode')
      if (savedDemo !== null) {
        setIsDemoModeState(savedDemo === 'true')
      }

      const savedEstudiantes = localStorage.getItem('pram_estudiantes')
      if (savedEstudiantes) {
        try { setEstudiantes(JSON.parse(savedEstudiantes)) } catch {}
      }

      const savedSesiones = localStorage.getItem('pram_sesiones')
      if (savedSesiones) {
        try { setSesiones(JSON.parse(savedSesiones)) } catch {}
      }

      const savedMentores = localStorage.getItem('pram_mentores')
      if (savedMentores) {
        try { setMentores(JSON.parse(savedMentores)) } catch {}
      }
    }
  }, [])

  const setIsDemoMode = useCallback((val: boolean) => {
    setIsDemoModeState(val)
    if (typeof window !== 'undefined') {
      localStorage.setItem('pram_demo_mode', String(val))
    }
  }, [])

  // Guardar en localStorage cuando se modifica data local
  const persistLocally = useCallback((key: string, data: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data))
    }
  }, [])

  // Cambiar rol de currentUser con datos de mock asociados
  const setCurrentUserRole = useCallback((role: UserRole) => {
    if (role === 'guest') {
      setCurrentUser(DEFAULT_GUEST_USER)
    } else if (role === 'estudiante') {
      const est = estudiantes[0] || {
        id: 'e-guest',
        nombre: 'Estudiante PRAM',
        pin: '1234',
        grado: '3ro',
        liceo_seccion: 'Liceo Minerva Mirabal · 3ro A',
        nivel_actual: 1,
        puntos_ranking: 0,
        racha_asistencia: 0,
        graduado_pram: false,
      }
      setCurrentUser({
        id: est.id,
        email: 'estudiante@pram.edu.do',
        nombre: est.nombre,
        role: 'estudiante',
        estudianteData: est,
      })
    } else if (role === 'mentor_junior') {
      const men = mentores[0] || {
        id: 'm-junior',
        nombre: 'Tutor PRAM',
        rango: 'Junior' as const,
        horas_acumuladas: 0,
        especialidad: 'General',
        puntos_ranking: 0,
      }
      setCurrentUser({
        id: men.id,
        email: 'tutor@pram.edu.do',
        nombre: men.nombre,
        role: 'mentor_junior',
        mentorData: men,
      })
      setActiveMentorId(men.id)
    } else if (role === 'head_mentor') {
      const men = mentores[0] || {
        id: 'm-head',
        nombre: 'Tutor Titular',
        rango: 'Head' as const,
        horas_acumuladas: 0,
        especialidad: 'General',
        puntos_ranking: 0,
      }
      setCurrentUser({
        id: men.id,
        email: 'titular@pram.edu.do',
        nombre: men.nombre,
        role: 'head_mentor',
        mentorData: men,
      })
      setActiveMentorId(men.id)
    } else if (role === 'director') {
      const sup = supervisores[0] || {
        id: 'sup-dir',
        nombre: 'Dirección del Liceo Minerva Mirabal',
        area: 'Matemáticas' as const,
        codigo_acceso: 'DIR-2026',
      }
      setCurrentUser({
        id: sup.id,
        email: 'carlos.lorzilien@gmail.com',
        nombre: sup.nombre,
        role: 'director',
        supervisorData: sup,
      })
    }
  }, [estudiantes, mentores, supervisores])

  // Auth interceptor helper (Candados de Acción)
  const requireAuth = useCallback((actionLabel: string, action: () => void) => {
    if (currentUser.role === 'guest') {
      setAuthModalState({
        isOpen: true,
        actionLabel,
        pendingAction: action,
      })
      return
    }
    action()
  }, [currentUser.role])

  const closeAuthModal = useCallback(() => {
    setAuthModalState({ isOpen: false, actionLabel: '' })
  }, [])

  // Supabase Auth Methods
  const signInWithGoogle = async (): Promise<{ success: boolean; needsOnboarding?: boolean }> => {
    if (!isDemoMode && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
          },
        })
        if (!error) return { success: true }
      } catch (e) {
        console.warn('OAuth redirect:', e)
      }
    }

    // Default to Head Mentor in Demo / Google fallback
    setCurrentUserRole('head_mentor')
    if (authModalState.pendingAction) {
      authModalState.pendingAction()
    }
    return { success: true }
  }

  const loginSimulado = (role: UserRole) => {
    setCurrentUserRole(role)
    if (authModalState.pendingAction) {
      authModalState.pendingAction()
    }
  }

  const signOut = async () => {
    if (supabase && !isDemoMode) {
      await supabase.auth.signOut()
    }
    setCurrentUser(DEFAULT_GUEST_USER)
  }

  const completeProfile = async (data: { nombre: string; role: 'estudiante' | 'mentor' }) => {
    if (data.role === 'estudiante') {
      setCurrentUserRole('estudiante')
    } else {
      setCurrentUserRole('head_mentor')
    }
    if (authModalState.pendingAction) {
      authModalState.pendingAction()
    }
  }

  // Carga inicial y Suscripciones Supabase Realtime si no está en Demo
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setConnectionError(null)

      if (isDemoMode || !isSupabaseConfigured || !supabase) {
        setIsCloudConnected(false)
        setIsLoading(false)
        return
      }

      try {
        const [cloudMentores, cloudEstudiantes, cloudSesiones, cloudExamenes, cloudSolicitudes] =
          await Promise.all([
            SupabaseService.getMentores(),
            SupabaseService.getEstudiantes(),
            SupabaseService.getSesiones(),
            SupabaseService.getExamenes(),
            SupabaseService.getSolicitudesRefuerzo(),
          ])

        if (cloudMentores.length > 0) {
          setMentores(cloudMentores)
          setActiveMentorId(cloudMentores[0].id)
        }
        if (cloudEstudiantes.length > 0) setEstudiantes(cloudEstudiantes)
        if (cloudSesiones.length > 0) setSesiones(cloudSesiones)
        if (cloudExamenes.length > 0) setExamenes(cloudExamenes)
        if (cloudSolicitudes.length > 0) setSolicitudes(cloudSolicitudes)

        setIsCloudConnected(true)
        setConnectionError(null)

        // Supabase Realtime
        const channel = supabase.channel('pram-realtime')
        channel.on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'estudiantes' },
            (payload) => {
              if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                const updatedStudent = payload.new as Estudiante
                setEstudiantes((prev) => {
                  const exists = prev.some((e) => e.id === updatedStudent.id)
                  const updatedList = exists
                    ? prev.map((e) => (e.id === updatedStudent.id ? updatedStudent : e))
                    : [updatedStudent, ...prev]
                  persistLocally('pram_estudiantes', updatedList)
                  return updatedList
                })
              }
            }
          )
        channel.on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'sesiones' },
            (payload) => {
              if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                const updatedSesion = payload.new as Sesion
                setSesiones((prev) => {
                  const exists = prev.some((s) => s.id === updatedSesion.id)
                  const updatedList = exists
                    ? prev.map((s) => (s.id === updatedSesion.id ? updatedSesion : s))
                    : [updatedSesion, ...prev]
                  persistLocally('pram_sesiones', updatedList)
                  return updatedList
                })
              }
            }
          )
        channel.subscribe()

        return () => {
          supabase!.removeChannel(channel)
        }
      } catch (err) {
        console.warn('PRAM: Modo Demo / Fallback local activo:', err)
        setIsCloudConnected(false)
        setConnectionError('Sin conexión. Datos locales activos.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [isDemoMode, persistLocally])

  // RBAC: Filtrado estricto de Estudiantes según el Rol del usuario
  const estudiantesVisibles = useMemo(() => {
    if (currentUser.role === 'estudiante') {
      return estudiantes.filter((e) => e.id === (currentUser.estudianteData?.id || 'e-1'))
    }
    if (currentUser.role === 'mentor_junior') {
      return estudiantes.filter((e) => e.mentor_id === currentUser.id)
    }
    // Head Mentor, Director, Guest ven la cohorte general
    return estudiantes
  }, [estudiantes, currentUser])

  // RBAC: Filtrado estricto de Sesiones según el Rol del usuario
  const sesionesVisibles = useMemo(() => {
    if (currentUser.role === 'estudiante') {
      return sesiones.filter((s) => s.estudiante_id === (currentUser.estudianteData?.id || 'e-1'))
    }
    if (currentUser.role === 'mentor_junior') {
      return sesiones.filter((s) => s.mentor_id === currentUser.id)
    }
    if (currentUser.role === 'head_mentor') {
      return sesiones.filter((s) => s.mentor_id === currentUser.id || s.mentor_id === activeMentorId)
    }
    return sesiones
  }, [sesiones, currentUser, activeMentorId])

  // Registrar Nuevo Mentor
  const registrarNuevoMentor = async (data: {
    nombre: string
    rango: MentorRango
    especialidad: AreaSupervision
  }): Promise<Mentor> => {
    const nuevoMentor: Mentor = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `m-${Date.now()}`,
      nombre: data.nombre,
      rango: data.rango,
      horas_acumuladas: 0,
      especialidad: data.especialidad,
      puntos_ranking: 0,
    }

    const updated = [nuevoMentor, ...mentores]
    setMentores(updated)
    persistLocally('pram_mentores', updated)

    if (!isDemoMode && isCloudConnected) {
      await SupabaseService.createMentor(nuevoMentor)
    }
    showToast('success', 'Mentor registrado', `${data.nombre} ha sido añadido al sistema.`)
    return nuevoMentor
  }

  // Registrar Nuevo Estudiante
  const registrarNuevoEstudiante = async (data: {
    nombre: string
    pin: string
    grado: GradoSecundaria
    liceo_seccion: string
    mentor_id: string
  }): Promise<Estudiante> => {
    const nuevoEstudiante: Estudiante = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `e-${Date.now()}`,
      nombre: data.nombre,
      pin: data.pin,
      grado: data.grado,
      liceo_seccion: data.liceo_seccion,
      nivel_actual: 2,
      mentor_id: data.mentor_id,
      nivel_pretest: 2,
      puntos_ranking: 100,
      racha_asistencia: 1,
      graduado_pram: false,
    }

    const updated = [...estudiantes, nuevoEstudiante]
    setEstudiantes(updated)
    persistLocally('pram_estudiantes', updated)

    if (!isDemoMode && isCloudConnected) {
      await SupabaseService.createEstudiante(nuevoEstudiante)
    }
    showToast('success', 'Estudiante registrado', `${data.nombre} fue añadido exitosamente.`)
    return nuevoEstudiante
  }

  // Eliminar Estudiante
  const eliminarEstudiante = async (id: string): Promise<boolean> => {
    const updated = estudiantes.filter((e) => e.id !== id)
    setEstudiantes(updated)
    persistLocally('pram_estudiantes', updated)

    if (!isDemoMode && isCloudConnected) {
      await SupabaseService.deleteEstudiante(id)
    }
    showToast('info', 'Estudiante eliminado', 'El registro ha sido removido del sistema.')
    return true
  }

  // Crear Nueva Sesión
  const crearNuevaSesion = async (data: {
    estudiante_id: string
    mentor_id: string
    tema: string
    materia: Materia
    fecha_programada: string
    duracion_minutos: number
    notas: string
  }): Promise<Sesion> => {
    const nuevaSesion: Sesion = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `s-${Date.now()}`,
      estudiante_id: data.estudiante_id,
      mentor_id: data.mentor_id,
      tema: data.tema,
      materia: data.materia,
      fecha_programada: data.fecha_programada,
      duracion_minutos: data.duracion_minutos,
      estado: 'Programada',
      confirmacion_mentor: true,
      confirmacion_estudiante: false,
      validado_por_auditoria: false,
      estado_auditoria: 'Pendiente',
      notas: data.notas,
    }

    const updated = [nuevaSesion, ...sesiones]
    setSesiones(updated)
    persistLocally('pram_sesiones', updated)

    if (!isDemoMode && isCloudConnected) {
      await SupabaseService.createSesion(nuevaSesion)
    }
    showToast('success', 'Sesión programada', `"${data.tema}" agendada correctamente.`)
    return nuevaSesion
  }

  // Validar PIN de Estudiante
  const verificarPinEstudiante = (pin: string): Estudiante | null => {
    return estudiantes.find((e) => e.pin === pin) || null
  }

  // Confirmar Asistencia con PIN Nómada
  const confirmarAsistenciaNomada = (sesionId: string, pin: string) => {
    const sesion = sesiones.find((s) => s.id === sesionId)
    if (!sesion) return { success: false, message: 'Sesión no encontrada' }

    const estudiante = estudiantes.find((e) => e.id === sesion.estudiante_id)
    if (!estudiante) return { success: false, message: 'Estudiante no encontrado' }

    if (estudiante.pin !== pin) {
      return { success: false, message: 'PIN incorrecto. Verifica los 4 dígitos.' }
    }

    const nuevaRacha = (estudiante.racha_asistencia || 0) + 1
    const delta = (estudiante.nivel_actual || 2) - (estudiante.nivel_pretest || 2)
    const nuevoPuntos = (delta * 100) + (nuevaRacha * 15)

    const updatedEstudiantes = estudiantes.map((e) =>
      e.id === estudiante.id
        ? { ...e, racha_asistencia: nuevaRacha, puntos_ranking: nuevoPuntos }
        : e
    )
    setEstudiantes(updatedEstudiantes)
    persistLocally('pram_estudiantes', updatedEstudiantes)

    const updatedSesiones = sesiones.map((s) => {
      if (s.id === sesionId) {
        const updated = {
          ...s,
          confirmacion_estudiante: true,
          estado: 'Completada' as EstadoSesion,
        }
        if (updated.confirmacion_mentor) {
          const mentor = mentores.find((m) => m.id === s.mentor_id)
          if (mentor) {
            const nuevasHoras = Number(mentor.horas_acumuladas) + s.duracion_minutos / 60
            const updatedMentores = mentores.map((m) =>
              m.id === mentor.id ? { ...m, horas_acumuladas: nuevasHoras } : m
            )
            setMentores(updatedMentores)
            persistLocally('pram_mentores', updatedMentores)
            if (!isDemoMode && isCloudConnected) {
              SupabaseService.updateMentorHoras(mentor.id, nuevasHoras)
            }
          }
        }
        if (!isDemoMode && isCloudConnected) {
          SupabaseService.updateSesion(s.id, {
            confirmacion_estudiante: true,
            estado: 'Completada',
          })
        }
        return updated
      }
      return s
    })

    setSesiones(updatedSesiones)
    persistLocally('pram_sesiones', updatedSesiones)

    return { success: true, message: `¡Asistencia confirmada para ${estudiante.nombre}!` }
  }

  // Confirmar Asistencia desde Dashboard del Estudiante
  const confirmarAsistenciaEstudiante = async (sesionId: string): Promise<boolean> => {
    const updatedSesiones = sesiones.map((s) => {
      if (s.id === sesionId) {
        const updated = {
          ...s,
          confirmacion_estudiante: true,
          estado: 'Completada' as EstadoSesion,
        }
        if (!isDemoMode && isCloudConnected) {
          SupabaseService.updateSesion(s.id, { confirmacion_estudiante: true, estado: 'Completada' })
        }
        return updated
      }
      return s
    })
    setSesiones(updatedSesiones)
    persistLocally('pram_sesiones', updatedSesiones)
    return true
  }

  // Solicitar Micro-Ruta
  const solicitarMicroRuta = async (data: { estudiante_id: string; tema: string; materia: Materia }): Promise<SolicitudRefuerzo> => {
    const nueva: SolicitudRefuerzo = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sol-${Date.now()}`,
      estudiante_id: data.estudiante_id,
      tema: data.tema,
      materia: data.materia,
      fecha_solicitud: '15 ago 2026',
      estado: 'Pendiente',
    }

    setSolicitudes((prev) => [nueva, ...prev])
    if (!isDemoMode && isCloudConnected) {
      await SupabaseService.createSolicitudRefuerzo(nueva)
    }
    showToast('info', 'Solicitud enviada', `Micro-ruta de "${data.tema}" en proceso.`)
    return nueva
  }

  // Confirmar por Mentor
  const confirmarSesionPorMentor = (sesionId: string) => {
    const updatedSesiones = sesiones.map((s) => {
      if (s.id === sesionId) {
        const updated = { ...s, confirmacion_mentor: true }
        if (updated.confirmacion_estudiante) {
          updated.estado = 'Completada'
          const mentor = mentores.find((m) => m.id === s.mentor_id)
          if (mentor) {
            const nuevasHoras = Number(mentor.horas_acumuladas) + s.duracion_minutos / 60
            const updatedMentores = mentores.map((m) =>
              m.id === mentor.id ? { ...m, horas_acumuladas: nuevasHoras } : m
            )
            setMentores(updatedMentores)
            persistLocally('pram_mentores', updatedMentores)
            if (!isDemoMode && isCloudConnected) {
              SupabaseService.updateMentorHoras(mentor.id, nuevasHoras)
            }
          }
        }
        if (!isDemoMode && isCloudConnected) {
          SupabaseService.updateSesion(s.id, {
            confirmacion_mentor: true,
            estado: updated.estado,
          })
        }
        return updated
      }
      return s
    })
    setSesiones(updatedSesiones)
    persistLocally('pram_sesiones', updatedSesiones)
    showToast('success', 'Sesión confirmada', 'Confirmación del mentor registrada.')
  }

  // Cambiar Estado Sesión
  const cambiarEstadoSesion = (sesionId: string, estado: EstadoSesion) => {
    const updatedSesiones = sesiones.map((s) => (s.id === sesionId ? { ...s, estado } : s))
    setSesiones(updatedSesiones)
    persistLocally('pram_sesiones', updatedSesiones)
    if (!isDemoMode && isCloudConnected) {
      SupabaseService.updateSesion(sesionId, { estado })
    }
  }

  // Registrar Examen Phygital
  const registrarExamenPhygital = async (data: {
    estudiante_id: string
    tipo: TipoExamen
    variante: VariantePrueba
    resultado_nivel: NivelDominio
    ai_analysis_summary: string
    foto_url: string
    respuestas_detectadas: Record<string, string>
  }) => {
    const nuevoExamen: ExamenDiagnostico = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ex-${Date.now()}`,
      estudiante_id: data.estudiante_id,
      tipo: data.tipo,
      variante: data.variante,
      fecha: '15 ago 2026',
      resultado_nivel: data.resultado_nivel,
      ai_analysis_summary: data.ai_analysis_summary,
      foto_url: data.foto_url,
      respuestas_detectadas: data.respuestas_detectadas,
    }

    setExamenes((prev) => [nuevoExamen, ...prev])

    const updatedEstudiantes = estudiantes.map((e) => {
      if (e.id === data.estudiante_id) {
        const updates: Partial<Estudiante> = { nivel_actual: data.resultado_nivel }
        if (data.tipo === 'Pre-Test') updates.nivel_pretest = data.resultado_nivel
        if (data.tipo === 'Post-Test') updates.nivel_posttest = data.resultado_nivel
        
        const delta = data.resultado_nivel - (e.nivel_pretest || 2)
        updates.puntos_ranking = (delta * 100) + ((e.racha_asistencia || 0) * 15)

        if (!isDemoMode && isCloudConnected) {
          SupabaseService.updateEstudiante(e.id, updates)
        }
        return { ...e, ...updates }
      }
      return e
    })

    setEstudiantes(updatedEstudiantes)
    persistLocally('pram_estudiantes', updatedEstudiantes)

    if (!isDemoMode && isCloudConnected) {
      await SupabaseService.createExamen(nuevoExamen)
    }
  }

  // Aprobación de Auditoría Manual (1 Sesión)
  const aprobarAuditoriaManual = async (sesionId: string): Promise<boolean> => {
    const updatedSesiones = sesiones.map((s) =>
      s.id === sesionId
        ? { ...s, validado_por_auditoria: true, estado_auditoria: 'Aprobado_Institucional' as EstadoAuditoria }
        : s
    )
    setSesiones(updatedSesiones)
    persistLocally('pram_sesiones', updatedSesiones)

    if (!isDemoMode && isCloudConnected) {
      SupabaseService.updateSesion(sesionId, {
        validado_por_auditoria: true,
        estado_auditoria: 'Aprobado_Institucional',
      })
    }
    showToast('success', 'Sesión aprobada Institucional', 'La sesión fue validada y registrada.')
    return true
  }

  // Aprobación Masiva de Auditoría Institucional
  const aprobarAuditoriaMasiva = async (sesionIds: string[]): Promise<boolean> => {
    const updatedSesiones = sesiones.map((s) =>
      sesionIds.includes(s.id)
        ? { ...s, validado_por_auditoria: true, estado_auditoria: 'Aprobado_Institucional' as EstadoAuditoria }
        : s
    )
    setSesiones(updatedSesiones)
    persistLocally('pram_sesiones', updatedSesiones)

    if (!isDemoMode && isCloudConnected) {
      for (const id of sesionIds) {
        SupabaseService.updateSesion(id, {
          validado_por_auditoria: true,
          estado_auditoria: 'Aprobado_Institucional',
        })
      }
    }
    showToast('success', 'Aprobación masiva completada', `${sesionIds.length} sesiones aprobadas para Institucional.`)
    return true
  }

  // Rechazar Auditoría
  const rechazarAuditoria = async (sesionId: string): Promise<boolean> => {
    const updatedSesiones = sesiones.map((s) =>
      s.id === sesionId
        ? { ...s, validado_por_auditoria: false, estado_auditoria: 'Rechazado' as EstadoAuditoria }
        : s
    )
    setSesiones(updatedSesiones)
    persistLocally('pram_sesiones', updatedSesiones)

    if (!isDemoMode && isCloudConnected) {
      SupabaseService.updateSesion(sesionId, {
        validado_por_auditoria: false,
        estado_auditoria: 'Rechazado',
      })
    }
    showToast('warning', 'Sesión rechazada', 'La sesión fue marcada como Rechazada.')
    return true
  }

  // Reasignar Mentor a Estudiante
  const reasignarMentorEstudiante = async (estudianteId: string, nuevoMentorId: string): Promise<boolean> => {
    const updatedEstudiantes = estudiantes.map((e) =>
      e.id === estudianteId ? { ...e, mentor_id: nuevoMentorId } : e
    )
    setEstudiantes(updatedEstudiantes)
    persistLocally('pram_estudiantes', updatedEstudiantes)

    if (!isDemoMode && isCloudConnected) {
      await SupabaseService.updateEstudiante(estudianteId, { mentor_id: nuevoMentorId })
    }
    showToast('success', 'Mentor reasignado', 'El estudiante fue transferido al nuevo mentor.')
    return true
  }

  // Autorizar Graduación PRAM
  const autorizarGraduacionPram = async (estudianteId: string): Promise<boolean> => {
    const updatedEstudiantes = estudiantes.map((e) =>
      e.id === estudianteId ? { ...e, graduado_pram: true } : e
    )
    setEstudiantes(updatedEstudiantes)
    persistLocally('pram_estudiantes', updatedEstudiantes)

    if (!isDemoMode && isCloudConnected) {
      await SupabaseService.updateEstudiante(estudianteId, { graduado_pram: true })
    }
    showToast('success', 'Graduación PRAM autorizada', 'El estudiante completó el programa exitosamente.')
    return true
  }

  // Lookups
  const getEstudianteById = (id: string) => estudiantes.find((e) => e.id === id)
  const getMentorById = (id: string) => mentores.find((m) => m.id === id)

  // Motor de Rankings: Top Mentores con Fórmula Oficial
  const getRankingMentores = (): MentorRankingItem[] => {
    return mentores
      .map((mentor) => {
        const alumnos = estudiantes.filter((e) => e.mentor_id === mentor.id)
        let totalDelta = 0
        alumnos.forEach((a) => {
          const delta = a.nivel_actual - (a.nivel_pretest || 2)
          totalDelta += delta
        })
        const deltaPromedio = alumnos.length > 0 ? Number((totalDelta / alumnos.length).toFixed(1)) : 1.0
        const horas = Number(mentor.horas_acumuladas) || 0
        const score = Math.round((horas * 10) + (deltaPromedio * 50))

        return {
          mentor,
          horas,
          delta_promedio: deltaPromedio,
          score,
          estudiantes_count: alumnos.length,
        }
      })
      .sort((a, b) => b.score - a.score)
  }

  // Motor de Rankings: Top Estudiantes con Fórmula Oficial
  const getRankingEstudiantes = (): EstudianteRankingItem[] => {
    return estudiantes
      .map((est) => {
        const deltaNivel = est.nivel_actual - (est.nivel_pretest || 2)
        const racha = est.racha_asistencia || 2
        const score = Math.round((deltaNivel * 100) + (racha * 15))

        let rango: RangoEstudiante = 'Novato'
        if (est.nivel_actual === 2) rango = 'Aspirante'
        if (est.nivel_actual === 3 || est.nivel_actual === 4) rango = 'Avanzado'
        if (est.nivel_actual === 5) rango = 'Élite'

        return {
          estudiante: est,
          delta_nivel: deltaNivel,
          racha,
          score,
          rango,
        }
      })
      .sort((a, b) => b.score - a.score)
  }

  // Sesiones Pendientes de Auditoría
  const getSesionesPendientesAuditoria = (): Sesion[] => {
    return sesiones.filter(
      (s) => s.estado_auditoria === 'Pendiente' || !s.validado_por_auditoria
    )
  }

  // Distribución de Estudiantes por Nivel
  const getEstudiantesPorNivel = (): Record<number, number> => {
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    estudiantes.forEach((e) => {
      const lvl = Math.max(1, Math.min(5, Math.round(e.nivel_actual)))
      dist[lvl] = (dist[lvl] || 0) + 1
    })
    return dist
  }

  const value = useMemo(
    () => ({
      currentUser,
      setCurrentUserRole,
      isDemoMode,
      setIsDemoMode,
      isGuestMode: currentUser.role === 'guest',
      signInWithGoogle,
      signOut,
      loginSimulado,
      completeProfile,
      requireAuth,
      authModalState,
      closeAuthModal,
      mentores,
      estudiantes,
      estudiantesVisibles,
      sesiones,
      sesionesVisibles,
      examenes,
      supervisores,
      solicitudes,
      activeMentorId,
      setActiveMentorId,
      isCloudConnected,
      isLoading,
      connectionError,
      registrarNuevoMentor,
      registrarNuevoEstudiante,
      eliminarEstudiante,
      crearNuevaSesion,
      verificarPinEstudiante,
      confirmarAsistenciaNomada,
      confirmarAsistenciaEstudiante,
      solicitarMicroRuta,
      confirmarSesionPorMentor,
      cambiarEstadoSesion,
      registrarExamenPhygital,
      aprobarAuditoriaManual,
      aprobarAuditoriaMasiva,
      rechazarAuditoria,
      reasignarMentorEstudiante,
      autorizarGraduacionPram,
      getEstudianteById,
      getMentorById,
      getRankingMentores,
      getRankingEstudiantes,
      getSesionesPendientesAuditoria,
      getEstudiantesPorNivel,
    }),
    [
      currentUser,
      isDemoMode,
      authModalState,
      mentores,
      estudiantes,
      estudiantesVisibles,
      sesiones,
      sesionesVisibles,
      examenes,
      supervisores,
      solicitudes,
      activeMentorId,
      isCloudConnected,
      isLoading,
      connectionError,
      requireAuth,
      closeAuthModal,
      setCurrentUserRole,
      setIsDemoMode,
    ]
  )

  return <PramContext.Provider value={value}>{children}</PramContext.Provider>
}

export function usePram() {
  const context = useContext(PramContext)
  if (!context) {
    throw new Error('usePram debe usarse dentro de un PramProvider')
  }
  return context
}
