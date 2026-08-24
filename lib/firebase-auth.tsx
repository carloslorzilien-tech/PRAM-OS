'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, googleProvider, db } from '@/lib/firebase'
import { Usuario } from '@/lib/db'

interface FirebaseAuthContextType {
  user: User | null
  userProfile: Usuario | null
  loading: boolean
  signInWithGoogle: () => Promise<Usuario | null>
  signOut: () => Promise<void>
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signInWithGoogle: async () => null,
  signOut: async () => {},
})

// ────────────────────────────────────────────────────────
// Helper: Emails pre-aprobados y su rol
// ────────────────────────────────────────────────────────
const DIRECTOR_EMAILS = ['carlos.lorzilien@gmail.com']
const MENTOR_EMAILS = [
  'carlosomarlorzilienservilien@gmail.com',
  'carlosmarlorzilienservilien@gmail.com',
]

function classifyEmail(email: string): { isDirector: boolean; isMentor: boolean } {
  const clean = email.toLowerCase().trim()
  return {
    isDirector: DIRECTOR_EMAILS.includes(clean),
    isMentor: MENTOR_EMAILS.includes(clean),
  }
}

/**
 * Construye un perfil `Usuario` garantizado a partir de datos de Firestore
 * y del `User` de Firebase Auth, normalizando campos faltantes.
 */
function buildUsuarioFromDoc(
  firebaseUser: User,
  firestoreData: Record<string, unknown> | null,
  classification: { isDirector: boolean; isMentor: boolean }
): Usuario {
  const email = (firebaseUser.email || '').toLowerCase().trim()
  const displayName =
    (firestoreData?.nombre as string) ||
    (firestoreData?.displayName as string) ||
    firebaseUser.displayName ||
    email.split('@')[0] ||
    'Usuario PRAM'

  // Determinar rol: prioridad a clasificación por email, luego al doc de Firestore
  let rol: Usuario['rol'] = 'MENTOR'
  if (classification.isDirector) {
    rol = 'DIRECTOR'
  } else if (firestoreData) {
    const docRol = (firestoreData.rol as string) || (firestoreData.role as string) || ''
    if (docRol === 'DIRECTOR' || docRol === 'AREA_DIRECTOR') {
      rol = docRol as Usuario['rol']
    }
  }

  let status: Usuario['status'] = 'PENDING'
  if (classification.isDirector || classification.isMentor) {
    status = 'APPROVED'
  } else if (firestoreData) {
    const docStatus = (firestoreData.status as string) || ''
    if (docStatus === 'APPROVED' || docStatus === 'REJECTED') {
      status = docStatus as Usuario['status']
    }
  }

  return {
    id: firebaseUser.uid,
    email,
    nombre: displayName,
    rol,
    area: classification.isMentor ? 'Matemáticas' : (firestoreData?.area as Usuario['area']) || null,
    status,
    created_at: (firestoreData?.created_at as string) || new Date().toISOString(),
  }
}

/**
 * Escribe/sincroniza el perfil del usuario en Firestore `users/{uid}`.
 * Usa `setDoc` con `merge: true` para no destruir campos existentes.
 */
async function syncProfileToFirestore(uid: string, profile: Usuario): Promise<void> {
  const userDocRef = doc(db, 'users', uid)
  await setDoc(
    userDocRef,
    {
      id: uid,
      uid,
      email: profile.email,
      nombre: profile.nombre,
      displayName: profile.nombre,
      role: profile.rol,
      rol: profile.rol,
      area: profile.area || null,
      status: profile.status,
      created_at: profile.created_at || new Date().toISOString(),
      createdAt: profile.created_at || new Date().toISOString(),
    },
    { merge: true }
  )
}

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  // ────────────────────────────────────────────────────────
  // onAuthStateChanged — listener global
  // ────────────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        const classification = classifyEmail(currentUser.email || '')

        try {
          const userDocRef = doc(db, 'users', currentUser.uid)
          const userDocSnap = await getDoc(userDocRef)
          const firestoreData = userDocSnap.exists() ? (userDocSnap.data() as Record<string, unknown>) : null

          const profile = buildUsuarioFromDoc(currentUser, firestoreData, classification)

          // Sincronizar con Firestore si es usuario nuevo o pre-aprobado que necesita fix
          const needsSync =
            !firestoreData ||
            (classification.isDirector && (firestoreData.rol !== 'DIRECTOR' || firestoreData.status !== 'APPROVED')) ||
            (classification.isMentor && firestoreData.status !== 'APPROVED') ||
            !firestoreData.nombre

          if (needsSync) {
            await syncProfileToFirestore(currentUser.uid, profile)
          }

          setUserProfile(profile)
        } catch (error) {
          console.error('[Firebase Auth Profile Error]:', error)
          // Fallback: construir perfil mínimo sin Firestore
          const fallbackProfile = buildUsuarioFromDoc(currentUser, null, classification)
          setUserProfile(fallbackProfile)
        }
      } else {
        setUser(null)
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // ────────────────────────────────────────────────────────
  // signInWithGoogle — popup + sync inmediato
  // ────────────────────────────────────────────────────────
  const signInWithGoogle = useCallback(async (): Promise<Usuario | null> => {
    try {
      setLoading(true)
      const result = await signInWithPopup(auth, googleProvider)
      const firebaseUser = result.user
      const classification = classifyEmail(firebaseUser.email || '')

      const userDocRef = doc(db, 'users', firebaseUser.uid)
      const userDocSnap = await getDoc(userDocRef)
      const firestoreData = userDocSnap.exists() ? (userDocSnap.data() as Record<string, unknown>) : null

      const profile = buildUsuarioFromDoc(firebaseUser, firestoreData, classification)

      // Siempre sincronizar tras login explícito para garantizar coherencia
      await syncProfileToFirestore(firebaseUser.uid, profile)

      // Actualizar estado React INMEDIATAMENTE
      setUser(firebaseUser)
      setUserProfile(profile)
      setLoading(false)

      return profile
    } catch (error) {
      console.error('[Firebase signInWithGoogle Error]:', error)
      setLoading(false)
      return null
    }
  }, [])

  // ────────────────────────────────────────────────────────
  // signOut
  // ────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
      setUserProfile(null)
    } catch (error) {
      console.error('[Firebase signOut Error]:', error)
    }
  }, [])

  return (
    <FirebaseAuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </FirebaseAuthContext.Provider>
  )
}

export function useFirebaseAuth() {
  return useContext(FirebaseAuthContext)
}
