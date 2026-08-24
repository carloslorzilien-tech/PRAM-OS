'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
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

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid)
          const userDocSnap = await getDoc(userDocRef)

          const email = (currentUser.email || '').toLowerCase().trim()
          const isDirector = email === 'carlos.lorzilien@gmail.com'
          const isMentor =
            email === 'carlosomarlorzilienservilien@gmail.com' ||
            email === 'carlosmarlorzilienservilien@gmail.com'

          if (userDocSnap.exists()) {
            const data = userDocSnap.data() as Usuario
            // Asegurar sincronización de rol para directores y mentores preaprobados
            if (isDirector && (data.rol !== 'DIRECTOR' || data.status !== 'APPROVED')) {
              data.rol = 'DIRECTOR'
              data.status = 'APPROVED'
              await setDoc(userDocRef, { role: 'DIRECTOR', rol: 'DIRECTOR', status: 'APPROVED' }, { merge: true })
            } else if (isMentor && data.status !== 'APPROVED') {
              data.rol = 'MENTOR'
              data.status = 'APPROVED'
              data.area = 'Matemáticas'
              await setDoc(userDocRef, { role: 'MENTOR', rol: 'MENTOR', status: 'APPROVED', area: 'Matemáticas' }, { merge: true })
            }
            setUserProfile(data)
          } else {
            // Auto-creación de perfil al registrarse
            const newProfile = {
              id: currentUser.uid,
              uid: currentUser.uid,
              email,
              nombre: currentUser.displayName || currentUser.email?.split('@')[0] || 'Usuario PRAM',
              displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Usuario PRAM',
              role: isDirector ? 'DIRECTOR' : 'MENTOR',
              rol: isDirector ? 'DIRECTOR' : 'MENTOR',
              area: isMentor ? 'Matemáticas' : undefined,
              status: isDirector || isMentor ? 'APPROVED' : 'PENDING',
              created_at: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            }

            await setDoc(userDocRef, newProfile, { merge: true })
            setUserProfile(newProfile as unknown as Usuario)
          }
        } catch (error) {
          console.error('[Firebase Auth Profile Error]:', error)
        }
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async (): Promise<Usuario | null> => {
    try {
      setLoading(true)
      const result = await signInWithPopup(auth, googleProvider)
      const firebaseUser = result.user
      const email = (firebaseUser.email || '').toLowerCase().trim()

      const userDocRef = doc(db, 'users', firebaseUser.uid)
      const userDocSnap = await getDoc(userDocRef)

      const isDirector = email === 'carlos.lorzilien@gmail.com'
      const isMentor =
        email === 'carlosomarlorzilienservilien@gmail.com' ||
        email === 'carlosmarlorzilienservilien@gmail.com'

      let profile: Usuario
      if (userDocSnap.exists()) {
        profile = userDocSnap.data() as Usuario
        if (isDirector && (profile.rol !== 'DIRECTOR' || profile.status !== 'APPROVED')) {
          profile.rol = 'DIRECTOR'
          profile.status = 'APPROVED'
          await setDoc(userDocRef, { role: 'DIRECTOR', rol: 'DIRECTOR', status: 'APPROVED' }, { merge: true })
        } else if (isMentor && profile.status !== 'APPROVED') {
          profile.rol = 'MENTOR'
          profile.status = 'APPROVED'
          profile.area = 'Matemáticas'
          await setDoc(userDocRef, { role: 'MENTOR', rol: 'MENTOR', status: 'APPROVED', area: 'Matemáticas' }, { merge: true })
        }
      } else {
        const newProfile = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          email,
          nombre: firebaseUser.displayName || email.split('@')[0] || 'Usuario PRAM',
          displayName: firebaseUser.displayName || email.split('@')[0] || 'Usuario PRAM',
          role: isDirector ? 'DIRECTOR' : 'MENTOR',
          rol: isDirector ? 'DIRECTOR' : 'MENTOR',
          area: isMentor ? 'Matemáticas' : undefined,
          status: isDirector || isMentor ? 'APPROVED' : 'PENDING',
          created_at: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        }
        await setDoc(userDocRef, newProfile, { merge: true })
        profile = newProfile as unknown as Usuario
      }

      setUser(firebaseUser)
      setUserProfile(profile)
      setLoading(false)
      return profile
    } catch (error) {
      console.error('[Firebase signInWithGoogle Error]:', error)
      setLoading(false)
      return null
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
      setUserProfile(null)
    } catch (error) {
      console.error('[Firebase signOut Error]:', error)
    }
  }

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
