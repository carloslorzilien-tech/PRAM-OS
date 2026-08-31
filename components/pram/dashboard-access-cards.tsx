'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Award, FileCheck, BookOpen, ArrowRight, Lock, Loader2 } from 'lucide-react'
import { useFirebaseAuth } from '@/lib/firebase-auth'

export function DashboardAccessCards() {
  const { user, userProfile, loading, signInWithGoogle } = useFirebaseAuth()
  const router = useRouter()

  const handleMentorAccess = async () => {
    if (user) {
      if (userProfile?.status === 'PENDING') {
        router.push('/solicitud-pendiente')
      } else {
        router.push('/dashboard/mentor')
      }
    } else {
      const loggedUser = await signInWithGoogle()
      if (loggedUser) {
        if (loggedUser.status === 'PENDING') {
          router.push('/solicitud-pendiente')
        } else {
          router.push('/dashboard/mentor')
        }
      }
    }
  }

  const handleDirectorAccess = async () => {
    if (user) {
      router.push('/dashboard/director')
    } else {
      const loggedUser = await signInWithGoogle()
      if (loggedUser) {
        router.push('/dashboard/director')
      }
    }
  }

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
      {/* Tarjeta 1: Panel del Tutor */}
      <button
        type="button"
        onClick={handleMentorAccess}
        className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between group text-left cursor-pointer"
      >
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="size-4 text-slate-900" />
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-slate-800">
                Panel del Tutor
              </h3>
            </div>
            {!user && (
              <span className="inline-flex items-center gap-1 rounded bg-slate-100 text-slate-500 text-[10px] font-semibold px-1.5 py-0.5">
                <Lock className="size-2.5" /> Acceso
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-normal">
            Registro ágil de tutorías y seguimiento en tiempo real de las 60 horas.
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-900">
          <span>{user ? 'Ingresar al Panel' : 'Ingresar con Google'}</span>
          <ArrowRight className="size-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
        </div>
      </button>

      {/* Tarjeta 2: Panel de Dirección */}
      <button
        type="button"
        onClick={handleDirectorAccess}
        className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between group text-left cursor-pointer"
      >
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="size-4 text-slate-900" />
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-slate-800">
                Panel de Dirección
              </h3>
            </div>
            {!user && (
              <span className="inline-flex items-center gap-1 rounded bg-slate-100 text-slate-500 text-[10px] font-semibold px-1.5 py-0.5">
                <Lock className="size-2.5" /> Oficial
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-normal">
            Auditoría, aprobación ministerial y emisión atómica de diplomas CUV.
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-900">
          <span>{user ? 'Ingresar al Panel' : 'Ingresar con Google'}</span>
          <ArrowRight className="size-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
        </div>
      </button>

      {/* Tarjeta 3: Recursos y Plantillas (Público) */}
      <Link
        href="/recursos"
        className="p-5 bg-slate-900 text-white rounded-2xl shadow-sm hover:bg-slate-800 transition-all flex flex-col justify-between group"
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-slate-300" />
            <h3 className="text-sm font-bold text-white">
              Recursos & Plantillas
            </h3>
          </div>
          <p className="text-xs text-slate-300 font-normal">
            Planillas de asistencia física y material pedagógico de apoyo.
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs font-semibold text-white">
          <span>Explorar Recursos</span>
          <ArrowRight className="size-3.5 text-slate-300 group-hover:translate-x-0.5 transition-all" />
        </div>
      </Link>
    </section>
  )
}
