import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { Sesion, Usuario, MateriaValida, CertificadoCUV } from '@/lib/db'
import { PramSession, CreatePramSessionInput, CuvCertificate } from '@/types/pram'

/**
 * 1. CREACIÓN DE SESIÓN (Firestore: colección 'sessions')
 *
 * El payload DEBE contener:
 *   - mentor_id / mentorId  ==  auth.currentUser.uid  (requerido por firestore.rules)
 *   - status / estado       ==  'pending'
 *   - createdAt             ==  serverTimestamp()
 *
 * Si auth.currentUser es null lanza error en lugar de escribir con uid falso.
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
  const currentUser = auth.currentUser
  if (!currentUser) {
    throw new Error('Debes iniciar sesión con Google antes de registrar una sesión.')
  }

  const currentUid = currentUser.uid
  const currentMentorName =
    currentUser.displayName ||
    ('mentor_nombre' in data ? data.mentor_nombre : undefined) ||
    ('mentorName' in data ? data.mentorName : undefined) ||
    'Tutor PRAM'

  const materia = ('materia' in data ? data.materia : 'Matemáticas') as MateriaValida
  const tema = ('tema' in data ? data.tema : '')
  const duracionMinutos = 'duracionMinutos' in data ? data.duracionMinutos : ('duracion_minutos' in data ? data.duracion_minutos : 45)
  const cantidadAlumnos = 'cantidadAlumnos' in data ? data.cantidadAlumnos : ('cantidad_alumnos' in data ? data.cantidad_alumnos : 1)
  const fechaSesion = 'fechaSesion' in data ? data.fechaSesion : ('fecha_sesion' in data ? data.fecha_sesion : new Date().toISOString().split('T')[0])
  const notas = ('notas' in data ? data.notas : '') || ''

  // Payload estricto: los campos mentor_id y mentorId DEBEN ser auth.currentUser.uid
  // para satisfacer la regla:  request.resource.data.get('mentor_id', '') == request.auth.uid
  const sessionPayload = {
    mentor_id: currentUid,
    mentorId: currentUid,
    tutorUid: currentUid,
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
    createdAt: serverTimestamp(),
    created_at: new Date().toISOString(),
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
 *
 * Requiere que auth.currentUser sea un Director con doc en users/{uid}
 * que tenga role='DIRECTOR' y status='APPROVED'.
 */
export async function approveFirebaseSession(
  sessionId: string,
  supervisorName = 'Dra. Carmen Batlle'
): Promise<boolean> {
  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('Debes iniciar sesión como Director para aprobar sesiones.')
    }

    const directorUid = currentUser.uid
    const directorName = currentUser.displayName || supervisorName
    const randomHex = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8).toUpperCase()
      : Math.random().toString(36).substring(2, 10).toUpperCase()
    
    const cleanCuvCode = `PRAM-2026-${randomHex}`

    // 1. Obtener la sesión actual para clonar sus metadatos
    const sessionDocRef = doc(db, 'sessions', sessionId)
    const sessionSnap = await getDoc(sessionDocRef)
    const sessionData = sessionSnap.exists() ? sessionSnap.data() : null

    const mentorId = sessionData?.mentor_id || sessionData?.mentorId || 'mentor-uid'
    const mentorName = sessionData?.mentor_nombre || sessionData?.mentorName || 'Tutor PRAM'
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
        mentor_nombre: data.mentor_nombre || data.mentorName || 'Tutor PRAM',
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

export async function updateUserRoleInFirestore(
  userId: string,
  role: 'DIRECTOR' | 'AREA_DIRECTOR' | 'MENTOR' | 'STUDENT',
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'INACTIVE' = 'APPROVED'
): Promise<boolean> {
  try {
    const userDocRef = doc(db, 'users', userId)
    await updateDoc(userDocRef, {
      role,
      rol: role,
      status,
    })
    return true
  } catch (error) {
    console.error('[Firebase updateUserRole Error]:', error)
    return false
  }
}

export async function createFlexibleCuvForMentor(
  mentorName: string,
  mentorId: string,
  horasAcumuladas: number,
  materia = 'Matemáticas'
): Promise<string | null> {
  try {
    const directorUid = auth.currentUser?.uid || 'director-admin'
    const directorName = auth.currentUser?.displayName || 'Dra. Carmen Batlle'
    const randomHex = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8).toUpperCase()
      : Math.random().toString(36).substring(2, 10).toUpperCase()
    
    const cleanCuvCode = `PRAM-2026-${randomHex}`
    const approvedAt = new Date().toISOString()

    const cuvDocRef = doc(db, 'cuvs', cleanCuvCode)
    await setDoc(cuvDocRef, {
      cuv: cleanCuvCode,
      cuv_codigo: cleanCuvCode,
      mentorId,
      mentor_nombre: mentorName,
      mentorName,
      materia,
      tema: `Acreditación de Refuerzo Académico (${horasAcumuladas.toFixed(1)}h)`,
      duracionMinutos: Math.round(horasAcumuladas * 60),
      horas: horasAcumuladas,
      horas_certificadas: horasAcumuladas,
      fecha_sesion: new Date().toISOString().split('T')[0],
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

    return cleanCuvCode
  } catch (error) {
    console.error('[Firebase createFlexibleCuv Error]:', error)
    return null
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

/**
 * 6. GESTIÓN GLOBAL DE USUARIOS (Solo Director)
 * Retorna todos los documentos de la colección 'users'.
 */
export async function getAllFirebaseUsers(): Promise<Usuario[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'))
    const users: Usuario[] = []
    querySnapshot.forEach((docSnap) => {
      users.push({ id: docSnap.id, ...(docSnap.data() as Omit<Usuario, 'id'>) })
    })
    return users
  } catch (error) {
    console.error('[Firebase getAllUsers Error]:', error)
    return []
  }
}

/**
 * Suscripción en tiempo real a todos los usuarios (para Director).
 */
export function subscribeToAllUsers(callback: (users: Usuario[]) => void) {
  return onSnapshot(
    collection(db, 'users'),
    (snapshot) => {
      const users: Usuario[] = []
      snapshot.forEach((docSnap) => {
        users.push({ id: docSnap.id, ...(docSnap.data() as Omit<Usuario, 'id'>) })
      })
      callback(users)
    },
    (err) => {
      console.warn('[Firebase subscribeToAllUsers warn]:', err)
    }
  )
}

/**
 * Actualiza el status de un usuario en Firestore.
 * Valores válidos: 'APPROVED' | 'PENDING' | 'REJECTED' | 'INACTIVE'
 */
export async function updateUserStatus(
  userId: string,
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'INACTIVE'
): Promise<boolean> {
  try {
    const userDocRef = doc(db, 'users', userId)
    await updateDoc(userDocRef, { status })
    return true
  } catch (error) {
    console.error('[Firebase updateUserStatus Error]:', error)
    return false
  }
}

/**
 * 7. GESTIÓN DE ALUMNOS (colección 'students')
 */
export interface StudentData {
  id: string
  mentorUid: string
  mentorName: string
  fullName: string
  grade: '3ero A' | '3ero B' | '4to A' | '4to B'
  subject: 'Matemáticas' | 'Lengua Española'
  notaInicial: number
  notaSeguimiento?: number | null
  notaPeriodo?: number | null
  createdAt?: string
}

export async function addStudent(
  data: Omit<StudentData, 'id' | 'createdAt'>
): Promise<StudentData | null> {
  try {
    const payload = {
      ...data,
      notaSeguimiento: data.notaSeguimiento ?? null,
      notaPeriodo: data.notaPeriodo ?? null,
      createdAt: new Date().toISOString(),
    }
    const docRef = await addDoc(collection(db, 'students'), payload)
    return { id: docRef.id, ...payload }
  } catch (error) {
    console.error('[Firebase addStudent Error]:', error)
    return null
  }
}

export async function getMentorStudents(mentorUid: string): Promise<StudentData[]> {
  try {
    const q = query(collection(db, 'students'), where('mentorUid', '==', mentorUid))
    const querySnapshot = await getDocs(q)
    const students: StudentData[] = []
    querySnapshot.forEach((docSnap) => {
      students.push({ id: docSnap.id, ...(docSnap.data() as Omit<StudentData, 'id'>) })
    })
    return students
  } catch (error) {
    console.error('[Firebase getMentorStudents Error]:', error)
    return []
  }
}

export function subscribeToMentorStudents(
  mentorUid: string,
  callback: (students: StudentData[]) => void
) {
  const q = query(collection(db, 'students'), where('mentorUid', '==', mentorUid))
  return onSnapshot(
    q,
    (snapshot) => {
      const students: StudentData[] = []
      snapshot.forEach((docSnap) => {
        students.push({ id: docSnap.id, ...(docSnap.data() as Omit<StudentData, 'id'>) })
      })
      callback(students)
    },
    (err) => {
      console.warn('[Firebase subscribeToMentorStudents warn]:', err)
    }
  )
}

export async function updateStudentGrade(
  studentId: string,
  fields: { notaSeguimiento?: number | null; notaPeriodo?: number | null }
): Promise<boolean> {
  try {
    const studentDocRef = doc(db, 'students', studentId)
    await updateDoc(studentDocRef, fields)
    return true
  } catch (error) {
    console.error('[Firebase updateStudentGrade Error]:', error)
    return false
  }
}

/**
 * 7b. SISTEMA DE EVALUACIONES TEMPORALES (Subcolección students/{id}/evaluaciones)
 *
 * Cada evaluación es un documento inmutable que preserva el historial temporal
 * completo del alumno: quizzes diarios, exámenes finales, etc.
 */
export interface Evaluacion {
  id: string
  fecha: string
  tipo: 'QUIZ' | 'EXAMEN_FINAL'
  calificacion: number
  tema: string
  observacion: string
  createdAt?: any
}

/**
 * Registra una nueva evaluación en la subcolección del alumno.
 * Las evaluaciones son inmutables una vez creadas.
 */
export async function addEvaluation(
  studentId: string,
  data: Omit<Evaluacion, 'id' | 'createdAt'>
): Promise<Evaluacion | null> {
  try {
    const evalCollRef = collection(db, 'students', studentId, 'evaluaciones')
    const payload = {
      ...data,
      createdAt: serverTimestamp(),
    }
    const docRef = await addDoc(evalCollRef, payload)
    return { id: docRef.id, ...data }
  } catch (error) {
    console.error('[Firebase addEvaluation Error]:', error)
    return null
  }
}

/**
 * Suscripción en tiempo real a las evaluaciones de un alumno, ordenadas por fecha.
 */
export function subscribeToEvaluations(
  studentId: string,
  callback: (evals: Evaluacion[]) => void
) {
  const evalCollRef = collection(db, 'students', studentId, 'evaluaciones')
  const q = query(evalCollRef, orderBy('fecha', 'asc'))
  return onSnapshot(
    q,
    (snapshot) => {
      const evals: Evaluacion[] = []
      snapshot.forEach((docSnap) => {
        evals.push({ id: docSnap.id, ...(docSnap.data() as Omit<Evaluacion, 'id'>) })
      })
      callback(evals)
    },
    (err) => {
      console.warn('[Firebase subscribeToEvaluations warn]:', err)
    }
  )
}

/**
 * Lectura one-shot de todas las evaluaciones de un alumno.
 */
export async function getStudentEvaluations(studentId: string): Promise<Evaluacion[]> {
  try {
    const evalCollRef = collection(db, 'students', studentId, 'evaluaciones')
    const q = query(evalCollRef, orderBy('fecha', 'asc'))
    const querySnapshot = await getDocs(q)
    const evals: Evaluacion[] = []
    querySnapshot.forEach((docSnap) => {
      evals.push({ id: docSnap.id, ...(docSnap.data() as Omit<Evaluacion, 'id'>) })
    })
    return evals
  } catch (error) {
    console.error('[Firebase getStudentEvaluations Error]:', error)
    return []
  }
}

/**
 * Suscripción en tiempo real a TODOS los alumnos del sistema (para Director / directorio institucional).
 */
export function subscribeToAllStudents(callback: (students: StudentData[]) => void) {
  return onSnapshot(
    collection(db, 'students'),
    (snapshot) => {
      const students: StudentData[] = []
      snapshot.forEach((docSnap) => {
        students.push({ id: docSnap.id, ...(docSnap.data() as Omit<StudentData, 'id'>) })
      })
      callback(students)
    },
    (err) => {
      console.warn('[Firebase subscribeToAllStudents warn]:', err)
    }
  )
}

/**
 * 8. REGISTRO DE SESIÓN + INCREMENTO ATÓMICO DE HORAS (writeBatch)
 *
 * Guarda la sesión en 'sessions' e incrementa horasAcumuladas / horas_acumuladas
 * en el documento del mentor en 'users/{uid}' en una sola transacción atómica.
 */
export async function submitSessionWithHours(data: {
  tema: string
  materia: MateriaValida
  horasInvertidas: number
  fechaSesion: string
  studentIds: string[]
  notas?: string
}): Promise<string | null> {
  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('Debes iniciar sesión antes de registrar una sesión.')
    }

    const mentorUid = currentUser.uid
    const mentorName = currentUser.displayName || 'Tutor PRAM'
    const duracionMinutos = Math.round(data.horasInvertidas * 60)

    const batch = writeBatch(db)

    // A) Crear documento de sesión
    const sessionRef = doc(collection(db, 'sessions'))
    batch.set(sessionRef, {
      mentor_id: mentorUid,
      mentorId: mentorUid,
      tutorUid: mentorUid,
      mentor_nombre: mentorName,
      mentorName,
      materia: data.materia,
      tema: data.tema,
      duracion_minutos: duracionMinutos,
      duracionMinutos,
      horas_invertidas: data.horasInvertidas,
      horasInvertidas: data.horasInvertidas,
      cantidad_alumnos: data.studentIds.length || 1,
      cantidadAlumnos: data.studentIds.length || 1,
      studentIds: data.studentIds,
      fecha_sesion: data.fechaSesion,
      fechaSesion: data.fechaSesion,
      notas: data.notas || '',
      estado: 'pending' as const,
      status: 'pending' as const,
      createdAt: serverTimestamp(),
      created_at: new Date().toISOString(),
    })

    // B) Incrementar horasAcumuladas del mentor en su doc de usuario
    const mentorUserRef = doc(db, 'users', mentorUid)
    const mentorSnap = await getDoc(mentorUserRef)
    const currentHoras = mentorSnap.exists()
      ? (mentorSnap.data().horasAcumuladas as number) || 0
      : 0
    const newHoras = Number((currentHoras + data.horasInvertidas).toFixed(2))

    batch.update(mentorUserRef, {
      horasAcumuladas: newHoras,
      horas_acumuladas: newHoras,
    })

    await batch.commit()
    return sessionRef.id
  } catch (error) {
    console.error('[Firebase submitSessionWithHours Error]:', error)
    return null
  }
}

