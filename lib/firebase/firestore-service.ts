import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  query,
  where,
} from 'firebase/firestore'
import { db } from './config'
import { Estudiante, Mentor, Sesion, ExamenDiagnostico } from '@/types/pram'

export const FirestoreService = {
  // --- MENTORES ---
  async saveMentor(mentor: Mentor): Promise<void> {
    try {
      const docRef = doc(db, 'mentores', mentor.id)
      await setDoc(docRef, mentor, { merge: true })
    } catch (e) {
      console.warn('Firestore offline/fallback: saveMentor', e)
    }
  },

  async getMentores(): Promise<Mentor[]> {
    try {
      const snap = await getDocs(collection(db, 'mentores'))
      return snap.docs.map((d) => d.data() as Mentor)
    } catch (e) {
      console.warn('Firestore offline/fallback: getMentores', e)
      return []
    }
  },

  // --- ESTUDIANTES ---
  async saveEstudiante(estudiante: Estudiante): Promise<void> {
    try {
      const docRef = doc(db, 'estudiantes', estudiante.id)
      await setDoc(docRef, estudiante, { merge: true })
    } catch (e) {
      console.warn('Firestore offline/fallback: saveEstudiante', e)
    }
  },

  async getEstudiantes(): Promise<Estudiante[]> {
    try {
      const snap = await getDocs(collection(db, 'estudiantes'))
      return snap.docs.map((d) => d.data() as Estudiante)
    } catch (e) {
      console.warn('Firestore offline/fallback: getEstudiantes', e)
      return []
    }
  },

  // --- SESIONES ---
  async saveSesion(sesion: Sesion): Promise<void> {
    try {
      const docRef = doc(db, 'sesiones', sesion.id)
      await setDoc(docRef, sesion, { merge: true })
    } catch (e) {
      console.warn('Firestore offline/fallback: saveSesion', e)
    }
  },

  async updateSesionState(
    sesionId: string,
    updates: Partial<Sesion>
  ): Promise<void> {
    try {
      const docRef = doc(db, 'sesiones', sesionId)
      await updateDoc(docRef, updates)
    } catch (e) {
      console.warn('Firestore offline/fallback: updateSesionState', e)
    }
  },

  // --- EXÁMENES DIAGNÓSTICOS (PHYGITAL) ---
  async saveExamen(examen: ExamenDiagnostico): Promise<void> {
    try {
      const docRef = doc(db, 'examenes', examen.id)
      await setDoc(docRef, examen, { merge: true })
    } catch (e) {
      console.warn('Firestore offline/fallback: saveExamen', e)
    }
  },
}
