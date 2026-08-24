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
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Sesion, Usuario, Mentor, PublicKPIs, MateriaValida } from '@/lib/db'

export async function createFirebaseSession(data: {
  mentor_id: string
  mentor_nombre?: string
  materia: MateriaValida
  tema: string
  duracion_minutos: number
  cantidad_alumnos: number
  fecha_sesion: string
  notas?: string
}): Promise<Sesion> {
  const sessionData = {
    mentor_id: data.mentor_id,
    mentor_nombre: data.mentor_nombre || 'Prof. Carlos Omar Lorzilien',
    materia: data.materia,
    tema: data.tema,
    duracion_minutos: data.duracion_minutos,
    cantidad_alumnos: data.cantidad_alumnos,
    fecha_sesion: data.fecha_sesion,
    notas: data.notas || '',
    estado: 'pending' as const,
    created_at: new Date().toISOString(),
  }

  const docRef = await addDoc(collection(db, 'sessions'), sessionData)
  return {
    id: docRef.id,
    ...sessionData,
  }
}

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

export async function approveFirebaseSession(
  sessionId: string,
  supervisorName = 'Dra. Carmen Batlle'
): Promise<boolean> {
  try {
    const cuv = `PRAM-2026-M${Math.floor(10 + Math.random() * 90)}-${Math.floor(1000 + Math.random() * 9000)}`
    const sessionDocRef = doc(db, 'sessions', sessionId)
    await updateDoc(sessionDocRef, {
      estado: 'approved',
      aprobado_por: supervisorName,
      fecha_aprobacion: new Date().toISOString(),
      cuv,
    })
    return true
  } catch (error) {
    console.error('[Firebase approveSession Error]:', error)
    return false
  }
}

export async function rejectFirebaseSession(sessionId: string): Promise<boolean> {
  try {
    const sessionDocRef = doc(db, 'sessions', sessionId)
    await updateDoc(sessionDocRef, {
      estado: 'rejected',
    })
    return true
  } catch (error) {
    console.error('[Firebase rejectSession Error]:', error)
    return false
  }
}

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
