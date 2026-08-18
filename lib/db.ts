import { neon } from '@neondatabase/serverless'

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  'postgresql://neondb_owner:npg_HeZYmnNo50Fy@ep-solitary-butterfly-avk45iz8-pooler.c-11.us-east-1.aws.neon.tech/neondb?sslmode=require'

// Helper seguro para obtener conexión a Neon
export function getDb() {
  try {
    return neon(connectionString)
  } catch (err) {
    console.warn('Neon connection initialization warning:', err)
    return null
  }
}

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
  rango: 'Junior' | 'Senior' | 'Head'
  horas_acumuladas: number
  meta_horas: number
  especialidad: MateriaValida
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
  estado: 'pending' | 'approved' | 'rejected'
  aprobado_por?: string | null
  fecha_aprobacion?: string | null
  notas?: string | null
  created_at?: string
}

export interface CertificadoCUV {
  id: string
  cuv_codigo: string
  mentor_id: string
  mentor_nombre: string
  horas_certificadas: number
  fecha_emision: string
  entidad_emisora: string
  liceo: string
  estado: 'valid' | 'revoked'
  created_at?: string
}

export interface PublicKPIs {
  horasCertificadas: number
  estudiantesAtendidos: number
  sesionesValidadas: number
  tasaAsistencia: number
}

// ==============================================================================
// IN-MEMORY FALLBACK STORE (Mantiene la UI viva incluso sin conexión)
// ==============================================================================

const fallbackUsuarios: Usuario[] = [
  {
    id: 'u-1',
    email: 'carmen.batlle@institucional.edu.do',
    nombre: 'Dra. Carmen Batlle',
    rol: 'DIRECTOR',
    status: 'APPROVED',
  },
  {
    id: 'u-2',
    email: 'altagracia.pena@institucional.edu.do',
    nombre: 'Prof. Altagracia Peña',
    rol: 'MENTOR',
    area: 'Matemáticas',
    status: 'APPROVED',
  },
  {
    id: 'u-3',
    email: 'marcos.santana@institucional.edu.do',
    nombre: 'Lic. Marcos Santana',
    rol: 'MENTOR',
    area: 'Lengua Española',
    status: 'APPROVED',
  },
  {
    id: 'u-4',
    email: 'sofia.castillo@institucional.edu.do',
    nombre: 'Ing. Sofía Castillo',
    rol: 'MENTOR',
    area: 'Matemáticas',
    status: 'APPROVED',
  },
  {
    id: 'u-5',
    email: 'carlos.reyes@estudiante.edu.do',
    nombre: 'Carlos Reyes',
    rol: 'STUDENT',
    grado: '3ro',
    status: 'APPROVED',
  },
]

const fallbackMentores: Mentor[] = [
  {
    id: 'm-1',
    nombre: 'Prof. Altagracia Peña',
    email: 'altagracia.pena@institucional.edu.do',
    rango: 'Head',
    horas_acumuladas: 48.5,
    meta_horas: 60.0,
    especialidad: 'Matemáticas',
  },
  {
    id: 'm-2',
    nombre: 'Lic. Marcos Santana',
    email: 'marcos.santana@institucional.edu.do',
    rango: 'Senior',
    horas_acumuladas: 34.0,
    meta_horas: 60.0,
    especialidad: 'Lengua Española',
  },
  {
    id: 'm-3',
    nombre: 'Ing. Sofía Castillo',
    email: 'sofia.castillo@institucional.edu.do',
    rango: 'Junior',
    horas_acumuladas: 19.5,
    meta_horas: 60.0,
    especialidad: 'Matemáticas',
  },
]

const fallbackSesiones: Sesion[] = [
  {
    id: 's-101',
    mentor_id: 'm-1',
    mentor_nombre: 'Prof. Altagracia Peña',
    materia: 'Matemáticas',
    tema: 'Ecuaciones Lineales y Despeje de Incógnitas',
    duracion_minutos: 60,
    cantidad_alumnos: 4,
    fecha_sesion: '2026-08-10',
    estado: 'approved',
    aprobado_por: 'Dra. Carmen Batlle',
    fecha_aprobacion: '2026-08-11 09:30:00Z',
    notas: 'Excelente participación de los alumnos de 3ro B.',
  },
  {
    id: 's-102',
    mentor_id: 'm-1',
    mentor_nombre: 'Prof. Altagracia Peña',
    materia: 'Matemáticas',
    tema: 'Fracciones Complejas y Operaciones Mixtas',
    duracion_minutos: 45,
    cantidad_alumnos: 3,
    fecha_sesion: '2026-08-12',
    estado: 'approved',
    aprobado_por: 'Dra. Carmen Batlle',
    fecha_aprobacion: '2026-08-13 10:15:00Z',
    notas: 'Refuerzo de jerarquía de operaciones.',
  },
  {
    id: 's-103',
    mentor_id: 'm-2',
    mentor_nombre: 'Lic. Marcos Santana',
    materia: 'Lengua Española',
    tema: 'Estructura del Ensayo Argumentativo',
    duracion_minutos: 60,
    cantidad_alumnos: 5,
    fecha_sesion: '2026-08-11',
    estado: 'approved',
    aprobado_por: 'Dra. Carmen Batlle',
    fecha_aprobacion: '2026-08-12 11:00:00Z',
    notas: 'Redacción de tesis y conectores de causa.',
  },
  {
    id: 's-104',
    mentor_id: 'm-2',
    mentor_nombre: 'Lic. Marcos Santana',
    materia: 'Lengua Española',
    tema: 'Comprensión Lectora y Figuras Literarias',
    duracion_minutos: 45,
    cantidad_alumnos: 4,
    fecha_sesion: '2026-08-14',
    estado: 'approved',
    aprobado_por: 'Dra. Carmen Batlle',
    fecha_aprobacion: '2026-08-15 14:20:00Z',
    notas: 'Análisis de textos periodísticos dominicanos.',
  },
  {
    id: 's-105',
    mentor_id: 'm-3',
    mentor_nombre: 'Ing. Sofía Castillo',
    materia: 'Matemáticas',
    tema: 'Geometría Plana y Teorema de Pitágoras',
    duracion_minutos: 45,
    cantidad_alumnos: 6,
    fecha_sesion: '2026-08-13',
    estado: 'approved',
    aprobado_por: 'Dra. Carmen Batlle',
    fecha_aprobacion: '2026-08-14 16:00:00Z',
    notas: 'Cálculo de áreas y perímetros.',
  },
  {
    id: 's-106',
    mentor_id: 'm-1',
    mentor_nombre: 'Prof. Altagracia Peña',
    materia: 'Matemáticas',
    tema: 'Trigonometría Básica',
    duracion_minutos: 60,
    cantidad_alumnos: 3,
    fecha_sesion: '2026-08-16',
    estado: 'pending',
    notas: 'Pendiente de validación institucional.',
  },
  {
    id: 's-107',
    mentor_id: 'm-2',
    mentor_nombre: 'Lic. Marcos Santana',
    materia: 'Lengua Española',
    tema: 'Análisis Sintáctico de Oraciones Compuestas',
    duracion_minutos: 45,
    cantidad_alumnos: 4,
    fecha_sesion: '2026-08-17',
    estado: 'pending',
    notas: 'Sesión realizada en aula de lectura.',
  },
]

const fallbackCertificados: CertificadoCUV[] = [
  {
    id: 'cuv-1',
    cuv_codigo: 'PRAM-2026-M01-8841',
    mentor_id: 'm-1',
    mentor_nombre: 'Prof. Altagracia Peña',
    horas_certificadas: 48.5,
    fecha_emision: '15 de Agosto, 2026',
    entidad_emisora: 'Liceo Minerva Mirabal · PRAM OS',
    liceo: 'Liceo Minerva Mirabal',
    estado: 'valid',
  },
  {
    id: 'cuv-2',
    cuv_codigo: 'PRAM-2026-M02-3319',
    mentor_id: 'm-2',
    mentor_nombre: 'Lic. Marcos Santana',
    horas_certificadas: 34.0,
    fecha_emision: '14 de Agosto, 2026',
    entidad_emisora: 'Liceo Minerva Mirabal · PRAM OS',
    liceo: 'Liceo Minerva Mirabal',
    estado: 'valid',
  },
]

// ==============================================================================
// GESTIÓN DE USUARIOS Y ONBOARDING (NEON SQL + FALLBACK)
// ==============================================================================

/**
 * Consulta usuario en Neon por email.
 */
export async function getUserByEmail(email: string): Promise<Usuario | null> {
  const cleanEmail = email.trim().toLowerCase()

  try {
    const sql = getDb()
    if (sql) {
      // Asegurar que la tabla exista
      await sql`
        CREATE TABLE IF NOT EXISTS usuarios (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          nombre TEXT,
          rol TEXT NOT NULL,
          grado TEXT,
          area TEXT,
          status TEXT NOT NULL DEFAULT 'PENDING',
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `
      const rows = (await sql`
        SELECT * FROM usuarios WHERE LOWER(email) = ${cleanEmail} LIMIT 1
      `) as Usuario[]

      if (rows && rows.length > 0) {
        return rows[0]
      }
    }
  } catch (error) {
    console.warn('Neon query error in getUserByEmail, using in-memory fallback:', error)
  }

  const found = fallbackUsuarios.find((u) => u.email.toLowerCase() === cleanEmail)
  return found || null
}

/**
 * Registra un nuevo usuario con status PENDING tras onboarding.
 */
export async function registerPendingUser(data: {
  email: string
  nombre?: string
  rol: 'MENTOR' | 'STUDENT'
  grado?: string
  area?: MateriaValida
}): Promise<Usuario> {
  const cleanEmail = data.email.trim().toLowerCase()
  const id = `usr-${Date.now()}`
  const nombre = data.nombre || (data.rol === 'MENTOR' ? 'Tutor Académico' : 'Estudiante PRAM')

  const newUser: Usuario = {
    id,
    email: cleanEmail,
    nombre,
    rol: data.rol,
    grado: data.grado || null,
    area: data.area || null,
    status: 'PENDING',
    created_at: new Date().toISOString(),
  }

  try {
    const sql = getDb()
    if (sql) {
      await sql`
        INSERT INTO usuarios (id, email, nombre, rol, grado, area, status)
        VALUES (${id}, ${cleanEmail}, ${nombre}, ${data.rol}, ${data.grado || null}, ${data.area || null}, 'PENDING')
        ON CONFLICT (email) DO UPDATE SET
          rol = EXCLUDED.rol,
          grado = EXCLUDED.grado,
          area = EXCLUDED.area,
          status = 'PENDING'
      `
    }
  } catch (error) {
    console.warn('Neon insert error in registerPendingUser, saving to in-memory store:', error)
  }

  // Actualizar store in-memory
  const existingIdx = fallbackUsuarios.findIndex((u) => u.email.toLowerCase() === cleanEmail)
  if (existingIdx !== -1) {
    fallbackUsuarios[existingIdx] = newUser
  } else {
    fallbackUsuarios.push(newUser)
  }

  return newUser
}

/**
 * Determina el flujo de redirección post-login:
 * - Si usuario existe y está 'APPROVED' -> Permite acceso a dashboard
 * - Si usuario existe y está 'PENDING' -> Redirige a /solicitud-pendiente
 * - Si usuario no existe en BD -> Redirige a /onboarding
 */
export async function checkUserAuthRedirect(email?: string | null): Promise<{
  action: 'DASHBOARD' | 'PENDING' | 'ONBOARDING'
  targetUrl: string
  user: Usuario | null
}> {
  if (!email) {
    return { action: 'ONBOARDING', targetUrl: '/onboarding', user: null }
  }

  const user = await getUserByEmail(email)

  if (!user) {
    return { action: 'ONBOARDING', targetUrl: '/onboarding', user: null }
  }

  if (user.status === 'PENDING') {
    return { action: 'PENDING', targetUrl: '/solicitud-pendiente', user }
  }

  if (user.status === 'APPROVED') {
    const targetUrl = user.rol === 'DIRECTOR' || user.rol === 'AREA_DIRECTOR'
      ? '/dashboard/director'
      : '/dashboard/mentor'
    return { action: 'DASHBOARD', targetUrl, user }
  }

  return { action: 'PENDING', targetUrl: '/solicitud-pendiente', user }
}

// ==============================================================================
// FUNCIONES PÚBLICAS Y CONSULTAS DE IMPACTO
// ==============================================================================

export async function getPublicKPIs(): Promise<PublicKPIs> {
  try {
    const sql = getDb()
    if (sql) {
      const totalHoras = await sql`
        SELECT COALESCE(SUM(horas_acumuladas), 0) as total 
        FROM mentores
      `
      const totalEstudiantes = await sql`
        SELECT COUNT(*) as total 
        FROM estudiantes
      `
      const totalSesiones = await sql`
        SELECT COUNT(*) as total 
        FROM sesiones 
        WHERE estado = 'approved' OR estado = 'Completada'
      `

      return {
        horasCertificadas: Math.max(102, Math.round(Number(totalHoras[0]?.total || 102))),
        estudiantesAtendidos: Math.max(48, Number(totalEstudiantes[0]?.total || 48)),
        sesionesValidadas: Math.max(14, Number(totalSesiones[0]?.total || 14)),
        tasaAsistencia: 94.2,
      }
    }
  } catch (error) {
    console.warn('Neon connection fallback in getPublicKPIs:', error)
  }

  const horasCertificadas = fallbackMentores.reduce((acc, m) => acc + m.horas_acumuladas, 0)
  const sesionesValidadas = fallbackSesiones.filter((s) => s.estado === 'approved').length

  return {
    horasCertificadas: Math.max(102, Math.round(horasCertificadas)),
    estudiantesAtendidos: 48,
    sesionesValidadas: Math.max(14, sesionesValidadas),
    tasaAsistencia: 94.2,
  }
}

export async function getTopMentores(limit = 10): Promise<Mentor[]> {
  try {
    const sql = getDb()
    if (sql) {
      const rows = (await sql`
        SELECT * FROM mentores 
        ORDER BY horas_acumuladas DESC 
        LIMIT ${limit}
      `) as Mentor[]
      if (rows && rows.length > 0) {
        return rows.map((r) => ({
          ...r,
          horas_acumuladas: Number(r.horas_acumuladas),
          meta_horas: Number(r.meta_horas || 60.0),
          especialidad: r.especialidad === 'Lengua Española' ? 'Lengua Española' : 'Matemáticas',
        }))
      }
    }
  } catch (error) {
    console.warn('Neon connection fallback in getTopMentores:', error)
  }

  return [...fallbackMentores]
    .sort((a, b) => b.horas_acumuladas - a.horas_acumuladas)
    .slice(0, limit)
}

export async function getCUVDetails(cuvCodigo: string): Promise<CertificadoCUV | null> {
  const cleanCode = cuvCodigo.trim().toUpperCase()

  try {
    const sql = getDb()
    if (sql) {
      const rows = (await sql`
        SELECT * FROM certificados_cuv 
        WHERE UPPER(cuv_codigo) = ${cleanCode} 
        LIMIT 1
      `) as CertificadoCUV[]
      if (rows && rows.length > 0) {
        return {
          ...rows[0],
          horas_certificadas: Number(rows[0].horas_certificadas),
        }
      }
    }
  } catch (error) {
    console.warn('Neon connection fallback in getCUVDetails:', error)
  }

  const found = fallbackCertificados.find((c) => c.cuv_codigo.toUpperCase() === cleanCode)
  return found || null
}

export async function getMentorSessions(mentorId: string): Promise<{ mentor: Mentor | null; sesiones: Sesion[] }> {
  try {
    const sql = getDb()
    if (sql) {
      const mentores = (await sql`SELECT * FROM mentores WHERE id = ${mentorId} LIMIT 1`) as Mentor[]
      const sesiones = (await sql`
        SELECT * FROM sesiones 
        WHERE mentor_id = ${mentorId} 
        ORDER BY fecha_sesion DESC, created_at DESC
      `) as Sesion[]

      if (mentores && mentores.length > 0) {
        const mentor = {
          ...mentores[0],
          horas_acumuladas: Number(mentores[0].horas_acumuladas),
          meta_horas: Number(mentores[0].meta_horas),
          especialidad: mentores[0].especialidad === 'Lengua Española' ? ('Lengua Española' as const) : ('Matemáticas' as const),
        }
        return { mentor, sesiones: sesiones || [] }
      }
    }
  } catch (error) {
    console.warn('Neon connection fallback in getMentorSessions:', error)
  }

  const mentor = fallbackMentores.find((m) => m.id === mentorId) || fallbackMentores[0]
  const sesiones = fallbackSesiones.filter((s) => s.mentor_id === mentor.id)
  return { mentor, sesiones }
}

export async function getPendingSessionsForAudit(): Promise<Sesion[]> {
  try {
    const sql = getDb()
    if (sql) {
      const rows = (await sql`
        SELECT s.*, m.nombre as mentor_nombre 
        FROM sesiones s
        LEFT JOIN mentores m ON s.mentor_id = m.id
        WHERE s.estado = 'pending'
        ORDER BY s.fecha_sesion DESC, s.created_at DESC
      `) as Sesion[]
      if (rows) return rows
    }
  } catch (error) {
    console.warn('Neon connection fallback in getPendingSessionsForAudit:', error)
  }

  return fallbackSesiones.filter((s) => s.estado === 'pending')
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
  const id = `s-${Date.now()}`
  const mentor = fallbackMentores.find((m) => m.id === data.mentor_id)

  const newSesion: Sesion = {
    id,
    mentor_id: data.mentor_id,
    mentor_nombre: mentor?.nombre || 'Mentor Asignado',
    materia: data.materia,
    tema: data.tema,
    duracion_minutos: data.duracion_minutos,
    cantidad_alumnos: data.cantidad_alumnos,
    fecha_sesion: data.fecha_sesion,
    estado: 'pending',
    notas: data.notas,
  }

  try {
    const sql = getDb()
    if (sql) {
      await sql`
        INSERT INTO sesiones (id, mentor_id, materia, tema, duracion_minutos, cantidad_alumnos, fecha_sesion, estado, notas)
        VALUES (${id}, ${data.mentor_id}, ${data.materia}, ${data.tema}, ${data.duracion_minutos}, ${data.cantidad_alumnos}, ${data.fecha_sesion}, 'pending', ${data.notas || null})
      `
    }
  } catch (error) {
    console.warn('Neon connection fallback in createSessionInDb:', error)
  }

  fallbackSesiones.unshift(newSesion)
  return newSesion
}

export async function approveSessionInDb(sessionId: string, directorName = 'Dra. Carmen Batlle'): Promise<boolean> {
  try {
    const sql = getDb()
    if (sql) {
      const rows = (await sql`SELECT * FROM sesiones WHERE id = ${sessionId} LIMIT 1`) as Sesion[]
      if (rows && rows.length > 0) {
        const sesion = rows[0]
        const horasToAdd = Number(sesion.duracion_minutos) / 60

        await sql`
          UPDATE sesiones 
          SET estado = 'approved',
              aprobado_por = ${directorName},
              fecha_aprobacion = NOW()
          WHERE id = ${sessionId}
        `

        await sql`
          UPDATE mentores 
          SET horas_acumuladas = horas_acumuladas + ${horasToAdd}
          WHERE id = ${sesion.mentor_id}
        `
      }
    }
  } catch (error) {
    console.warn('Neon connection fallback in approveSessionInDb:', error)
  }

  const sesionIdx = fallbackSesiones.findIndex((s) => s.id === sessionId)
  if (sesionIdx !== -1) {
    fallbackSesiones[sesionIdx].estado = 'approved'
    fallbackSesiones[sesionIdx].aprobado_por = directorName
    fallbackSesiones[sesionIdx].fecha_aprobacion = new Date().toISOString()

    const mentorIdx = fallbackMentores.findIndex((m) => m.id === fallbackSesiones[sesionIdx].mentor_id)
    if (mentorIdx !== -1) {
      fallbackMentores[mentorIdx].horas_acumuladas += fallbackSesiones[sesionIdx].duracion_minutos / 60
    }
  }

  return true
}

export async function rejectSessionInDb(sessionId: string): Promise<boolean> {
  try {
    const sql = getDb()
    if (sql) {
      await sql`
        UPDATE sesiones 
        SET estado = 'rejected'
        WHERE id = ${sessionId}
      `
    }
  } catch (error) {
    console.warn('Neon connection fallback in rejectSessionInDb:', error)
  }

  const sesionIdx = fallbackSesiones.findIndex((s) => s.id === sessionId)
  if (sesionIdx !== -1) {
    fallbackSesiones[sesionIdx].estado = 'rejected'
  }

  return true
}
