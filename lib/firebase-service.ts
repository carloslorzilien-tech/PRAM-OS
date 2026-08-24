import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { Sesion, Usuario, MateriaValida, CertificadoCUV } from '@/lib/db'
import { PramSession, CreatePramSessionInput, CuvCertificate } from '@/types/pram'

/**
 * 1. CREACIÓN DE SESIÓN (Firestore: colección 'sessions')
 * Extrae automáticamente el mentorId de auth.currentUser si está disponible.
 */
export async function createFirebaseSession(
  data: CreatePramSessionInput | {
    mentor_id?: string
    mentor_nombre?: string
    materia: MateriaValida
    tema: string
    duracion_minutos: number
    cantidad_alumnos: number
    fecha_sesion: string
    notas?: string
  }
): Promise<Sesion> {
  const currentUid = auth.currentUser?.uid || ('mentor_id' in data ? data.mentor_id : undefined) || 'm-1'
  const currentMentorName =
    auth.currentUser?.displayName ||
    ('mentor_nombre' in data ? data.mentor_nombre : undefined) ||
    ('mentorName' in data ? data.mentorName : undefined) ||
    'Prof. Carlos Omar Lorzilien'

  const materia = ('materia' in data ? data.materia : 'Matemáticas') as MateriaValida
  const tema = ('tema' in data ? data.tema : '')
  const duracionMinutos = 'duracionMinutos' in data ? data.duracionMinutos : ('duracion_minutos' in data ? data.duracion_minutos : 45)
  const cantidadAlumnos = 'cantidadAlumnos' in data ? data.cantidadAlumnos : ('cantidad_alumnos' in data ? data.cantidad_alumnos : 1)
  const fechaSesion = 'fechaSesion' in data ? data.fechaSesion : ('fecha_sesion' in data ? data.fecha_sesion : new Date().toISOString().split('T')[0])
  const notas = ('notas' in data ? data.notas : '') || ''

  const sessionPayload = {
    mentor_id: currentUid,
    mentorId: currentUid,
    mentor_nombre: currentMentorName,
    mentorName: currentMentorName,
    materia,
    tema,
    duracion_minutos: duracionMinutos,
    duracionMinutos,
    cantidad_alumnos: cantidadAlumnos,
    cantidadAlumnos,
    fecha_sesion: fechaSesion,
    fechaSesion,
    notas,
    estado: 'pending' as const,
    status: 'pending' as const,
    created_at: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  }

  const docRef = await addDoc(collection(db, 'sessions'), sessionPayload)
  return {
    id: docRef.id,
    mentor_id: currentUid,
    mentor_nombre: currentMentorName,
    materia,
    tema,
    duracion_minutos: duracionMinutos,
    cantidad_alumnos: cantidadAlumnos,
    fecha_sesion: fechaSesion,
    notas,
    estado: 'pending',
    created_at: sessionPayload.created_at,
  }
}

/**
 * 2. LECTURA DE SESIONES
 */
export async function getFirebaseSessions(mentorId?: string): Promise<Sesion[]> {
  try {
    let q = query(collection(db, 'sessions'), orderBy('fecha_sesion', 'desc'))
    if (mentorId) {
      q = query(
        collection(db, 'sessions'),
        where('mentor_id', '==', mentorId),
        orderBy('fecha_sesion', 'desc')
      )
    }
    const querySnapshot = await getDocs(q)
    const sessions: Sesion[] = []
    querySnapshot.forEach((docSnap) => {
      sessions.push({ id: docSnap.id, ...(docSnap.data() as Omit<Sesion, 'id'>) })
    })
    return sessions
  } catch (error) {
    console.error('[Firebase getSessions Error]:', error)
    return []
  }
}

export async function getFirebasePendingSessions(): Promise<Sesion[]> {
  try {
    const q = query(collection(db, 'sessions'), where('estado', '==', 'pending'))
    const querySnapshot = await getDocs(q)
    const sessions: Sesion[] = []
    querySnapshot.forEach((docSnap) => {
      sessions.push({ id: docSnap.id, ...(docSnap.data() as Omit<Sesion, 'id'>) })
    })
    return sessions
  } catch (error) {
    console.error('[Firebase getPendingSessions Error]:', error)
    return []
  }
}

/**
 * 3. APROBACIÓN ATÓMICA DE SESIÓN Y GENERACIÓN DE CUV (writeBatch)
 */
export async function approveFirebaseSession(
  sessionId: string,
  supervisorName = 'Dra. Carmen Batlle'
): Promise<boolean> {
  try {
    const directorUid = auth.currentUser?.uid || 'director-admin'
    const directorName = auth.currentUser?.displayName || supervisorName
    const randomHex = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8).toUpperCase()
      : Math.random().toString(36).substring(2, 10).toUpperCase()
    
    const cleanCuvCode = `PRAM-2026-${randomHex}`

    // 1. Obtener la sesión actual para clonar sus metadatos
    const sessionDocRef = doc(db, 'sessions', sessionId)
    const sessionSnap = await getDoc(sessionDocRef)
    const sessionData = sessionSnap.exists() ? sessionSnap.data() : null

    const mentorId = sessionData?.mentor_id || sessionData?.mentorId || 'mentor-uid'
    const mentorName = sessionData?.mentor_nombre || sessionData?.mentorName || 'Prof. Carlos Omar Lorzilien'
    const materia = sessionData?.materia || 'Matemáticas'
    const tema = sessionData?.tema || 'Refuerzo Académico'
    const duracionMinutos = sessionData?.duracion_minutos || sessionData?.duracionMinutos || 45
    const horas = Number((duracionMinutos / 60).toFixed(2))
    const fechaSesion = sessionData?.fecha_sesion || sessionData?.fechaSesion || new Date().toISOString().split('T')[0]
    const approvedAt = new Date().toISOString()

    // 2. Ejecutar writeBatch para actualizar sesión y crear CUV en una sola transacción atómica
    const batch = writeBatch(db)

    // A) Actualización de sesión
    batch.update(sessionDocRef, {
      estado: 'approved',
      status: 'approved',
      aprobado_por: directorName,
      approvedBy: directorName,
      directorUid,
      fecha_aprobacion: approvedAt,
      approvedAt,
      cuv: cleanCuvCode,
    })

    // B) Creación del documento en la colección pública 'cuvs'
    const cuvDocRef = doc(db, 'cuvs', cleanCuvCode)
    batch.set(cuvDocRef, {
      cuv: cleanCuvCode,
      cuv_codigo: cleanCuvCode,
      sessionId,
      mentorId,
      mentor_nombre: mentorName,
      mentorName,
      materia,
      tema,
      duracionMinutos,
      horas,
      horas_certificadas: horas,
      fecha_sesion: fechaSesion,
      fecha_emision: new Date().toLocaleDateString('es-DO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      directorUid,
      directorName,
      aprobado_por: directorName,
      approvedAt,
      liceo: 'Liceo Minerva Mirabal · PRAM OS',
      entidad_emisora: 'Ministerio de Educación (MINERD) · Liceo Minerva Mirabal',
      valido: true,
      estado: 'valid',
      created_at: approvedAt,
    })

    await batch.commit()
    return true
  } catch (error) {
    console.error('[Firebase approveSession batch error]:', error)
    return false
  }
}

export async function rejectFirebaseSession(sessionId: string): Promise<boolean> {
  try {
    const sessionDocRef = doc(db, 'sessions', sessionId)
    await updateDoc(sessionDocRef, {
      estado: 'rejected',
      status: 'rejected',
    })
    return true
  } catch (error) {
    console.error('[Firebase rejectSession Error]:', error)
    return false
  }
}

/**
 * 4. VERIFICACIÓN DIRECTA O(1) POR ID DE DOCUMENTO EN 'cuvs'
 */
export async function verifyCuvCode(cuvCode: string): Promise<CertificadoCUV | null> {
  try {
    const cleanCode = decodeURIComponent(cuvCode).trim().toUpperCase()
    const cuvDocRef = doc(db, 'cuvs', cleanCode)
    const cuvSnap = await getDoc(cuvDocRef)

    if (cuvSnap.exists()) {
      const data = cuvSnap.data()
      return {
        id: cuvSnap.id,
        cuv_codigo: data.cuv_codigo || cleanCode,
        mentor_nombre: data.mentor_nombre || data.mentorName || 'Prof. Carlos Omar Lorzilien',
        horas_certificadas: data.horas_certificadas || data.horas || 60.0,
        liceo: data.liceo || 'Liceo Minerva Mirabal · PRAM OS',
        fecha_emision: data.fecha_emision || new Date().toLocaleDateString('es-DO'),
        entidad_emisora: data.entidad_emisora || 'Ministerio de Educación (MINERD) · Liceo Minerva Mirabal',
        estado: (data.valido || data.estado === 'valid') ? 'valid' : 'invalid',
      }
    }

    // Fallback de demostración para el código por defecto
    if (cleanCode === 'PRAM-2026-M01-8841') {
      return {
        id: 'cert-default',
        cuv_codigo: cleanCode,
        mentor_nombre: 'Prof. Carlos Omar Lorzilien',
        horas_certificadas: 60.0,
        liceo: 'Liceo Minerva Mirabal · PRAM OS',
        fecha_emision: '15 de Agosto de 2026',
        entidad_emisora: 'Ministerio de Educación (MINERD) · Liceo Minerva Mirabal',
        estado: 'valid',
      }
    }

    return null
  } catch (error) {
    console.error('[Firebase verifyCuvCode Error]:', error)
    return null
  }
}

/**
 * 5. GESTIÓN DE USUARIOS EN FIRESTORE
 */
export async function getFirebasePendingUsers(): Promise<Usuario[]> {
  try {
    const q = query(collection(db, 'users'), where('status', '==', 'PENDING'))
    const querySnapshot = await getDocs(q)
    const users: Usuario[] = []
    querySnapshot.forEach((docSnap) => {
      users.push({ id: docSnap.id, ...(docSnap.data() as Omit<Usuario, 'id'>) })
    })
    return users
  } catch (error) {
    console.error('[Firebase getPendingUsers Error]:', error)
    return []
  }
}

export async function approveFirebaseUser(userId: string): Promise<boolean> {
  try {
    const userDocRef = doc(db, 'users', userId)
    await updateDoc(userDocRef, {
      status: 'APPROVED',
    })
    return true
  } catch (error) {
    console.error('[Firebase approveUser Error]:', error)
    return false
  }
}

export async function rejectFirebaseUser(userId: string): Promise<boolean> {
  try {
    const userDocRef = doc(db, 'users', userId)
    await updateDoc(userDocRef, {
      status: 'REJECTED',
    })
    return true
  } catch (error) {
    console.error('[Firebase rejectUser Error]:', error)
    return false
  }
}

export function subscribeToFirebaseSessions(
  mentorId: string | undefined,
  callback: (sessions: Sesion[]) => void
) {
  let q = query(collection(db, 'sessions'), orderBy('fecha_sesion', 'desc'))
  if (mentorId) {
    q = query(
      collection(db, 'sessions'),
      where('mentor_id', '==', mentorId),
      orderBy('fecha_sesion', 'desc')
    )
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const sessions: Sesion[] = []
      snapshot.forEach((docSnap) => {
        sessions.push({ id: docSnap.id, ...(docSnap.data() as Omit<Sesion, 'id'>) })
      })
      callback(sessions)
    },
    (err) => {
      console.warn('[Firebase subscribeToSessions snapshot warn]:', err)
    }
  )
}
