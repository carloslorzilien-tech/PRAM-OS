'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
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

          if (userDocSnap.exists()) {
            setUserProfile(userDocSnap.data() as Usuario)
          } else {
            // Auto-creación de perfil al registrarse
            const email = (currentUser.email || '').toLowerCase().trim()
            const isDirector = email === 'carlos.lorzilien@gmail.com'
            const isMentor =
              email === 'carlosomarlorzilienservilien@gmail.com' ||
              email === 'carlosmarlorzilienservilien@gmail.com'

            const newProfile: Usuario = {
              id: currentUser.uid,
              email,
              nombre: currentUser.displayName || currentUser.email?.split('@')[0] || 'Usuario PRAM',
              rol: isDirector ? 'DIRECTOR' : 'MENTOR',
              area: isMentor ? 'Matemáticas' : undefined,
              status: isDirector || isMentor ? 'APPROVED' : 'PENDING',
              created_at: new Date().toISOString(),
            }

            await setDoc(userDocRef, newProfile, { merge: true })
            setUserProfile(newProfile)
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
        if (isDirector && profile.rol !== 'DIRECTOR') {
          profile.rol = 'DIRECTOR'
          profile.status = 'APPROVED'
          await setDoc(userDocRef, { rol: 'DIRECTOR', status: 'APPROVED' }, { merge: true })
        } else if (isMentor && profile.status !== 'APPROVED') {
          profile.rol = 'MENTOR'
          profile.status = 'APPROVED'
          profile.area = 'Matemáticas'
          await setDoc(userDocRef, { rol: 'MENTOR', status: 'APPROVED', area: 'Matemáticas' }, { merge: true })
        }
      } else {
        profile = {
          id: firebaseUser.uid,
          email,
          nombre: firebaseUser.displayName || email.split('@')[0] || 'Usuario PRAM',
          rol: isDirector ? 'DIRECTOR' : 'MENTOR',
          area: isMentor ? 'Matemáticas' : undefined,
          status: isDirector || isMentor ? 'APPROVED' : 'PENDING',
          created_at: new Date().toISOString(),
        }
        await setDoc(userDocRef, profile, { merge: true })
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
