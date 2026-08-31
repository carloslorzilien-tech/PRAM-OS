'use client'

import React, { useEffect, useState } from 'react'
import {
  ShieldCheck,
  Award,
  Users,
  Clock,
  CheckCircle2,
  Loader2,
  GraduationCap,
} from 'lucide-react'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Mentor } from '@/lib/db'

interface MentorImpactTableProps {
  initialMentores?: Mentor[]
}

interface FirestoreUserItem {
  id: string
  nombre?: string
  name?: string
  email?: string
  rol?: string
  role?: string
  status?: string
  area?: string
  especialidad?: string
  horasAcumuladas?: number
  horas_acumuladas?: number
  metaHoras?: number
  meta_horas?: number
}

export function MentorImpactTable({ initialMentores = [] }: MentorImpactTableProps) {
  const [mentores, setMentores] = useState<Mentor[]>(initialMentores)
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    try {
      const usersRef = collection(db, 'users')
      const unsub = onSnapshot(
        usersRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const rawUsers: FirestoreUserItem[] = []
            snapshot.forEach((docSnap) => {
              rawUsers.push({ id: docSnap.id, ...docSnap.data() } as FirestoreUserItem)
            })

            // Filtrar usuarios relevantes (mentores, directores o usuarios con horas)
            const filtered = rawUsers.filter((u) => {
              const r = (u.rol || u.role || '').toUpperCase()
              const s = (u.status || '').toUpperCase()
              // Mostrar si no está inactivo y tiene rol de tutor/mentor/director o tiene horas acumuladas
              return (
                s !== 'INACTIVE' &&
                s !== 'REJECTED' &&
                (r.includes('MENTOR') ||
                  r.includes('TUTOR') ||
                  r.includes('DIRECTOR') ||
                  (u.horasAcumuladas ?? u.horas_acumuladas ?? 0) > 0)
              )
            })

            // Mapear al modelo Mentor con rangos institucionales profesionales dinámicos
            const mapped: Mentor[] = filtered.map((u) => {
              const horas = Number(u.horasAcumuladas ?? u.horas_acumuladas ?? 0)
              const meta = Number(u.metaHoras ?? u.meta_horas ?? 60)
              const name = u.nombre || u.name || (u.email ? u.email.split('@')[0] : 'Tutor PRAM')
              const area = u.area || u.especialidad || 'Refuerzo Académico'

              // Asignación de Rango Institucional según progreso de horas
              let rango = 'Tutor en Certificación'
              if (horas >= 60) {
                rango = 'Líder de Área'
              } else if (horas >= 30) {
                rango = 'Mentor Sénior'
              } else if (horas >= 10) {
                rango = 'Tutor Titular'
              }

              return {
                id: u.id,
                nombre: name,
                email: u.email || '',
                rango,
                horas_acumuladas: horas,
                meta_horas: meta,
                especialidad: area,
              }
            })

            // Ordenar descendentemente por horas acumuladas
            mapped.sort((a, b) => b.horas_acumuladas - a.horas_acumuladas)

            if (mapped.length > 0) {
              setMentores(mapped)
              setIsLive(true)
            }
          }
          setLoading(false)
        },
        (err) => {
          console.warn('[MentorImpactTable] Fallback a datos locales:', err)
          setLoading(false)
        }
      )

      return () => unsub()
    } catch (err) {
      console.warn('[MentorImpactTable] Error al inicializar listener:', err)
      setLoading(false)
    }
  }, [])

  // Helper para renderizar badge de rango profesional
  const renderRangoBadge = (rango: string, horas: number) => {
    if (horas >= 60) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold tracking-tight">
          <ShieldCheck className="size-3 text-emerald-600" />
          <span>Acreditado CUV · 60h</span>
        </span>
      )
    }
    if (horas >= 30) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-semibold">
          <span>Mentor Sénior</span>
        </span>
      )
    }
    if (horas >= 10) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-[10px] font-semibold">
          <span>Tutor Titular</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-0.5 text-[10px] font-medium">
        <span>Tutor en Certificación</span>
      </span>
    )
  }

  return (
    <section className="space-y-4">
      {/* Header Institucional */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold tracking-tight text-slate-900">
              Cuadro de Estatus e Impacto de Mentores
            </h2>
            {isLive && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold px-2 py-0.5">
                <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>Tiempo Real</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-normal">
            Acreditación institucional de horas pedagógicas aportadas al servicio social (60 horas requeridas).
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Período Académico 2026-2
          </span>
          <span className="text-[11px] text-slate-400">
            {mentores.length} tutor{mentores.length !== 1 ? 'es' : ''} registrado{mentores.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Tabla Profesional */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading && mentores.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-xs">Sincronizando cuadro de impacto...</span>
          </div>
        ) : mentores.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-800">No hay mentores registrados aún.</p>
            <p className="text-slate-400">Las horas registradas por los docentes aparecerán aquí automáticamente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[560px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th scope="col" className="px-5 py-3.5 w-12 text-center">#</th>
                  <th scope="col" className="px-5 py-3.5">Docente / Tutor</th>
                  <th scope="col" className="px-5 py-3.5 hidden sm:table-cell">Especialidad</th>
                  <th scope="col" className="px-5 py-3.5">Rango Institucional</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Horas Validadas</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Avance Acreditación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {mentores.map((mentor, index) => {
                  const horas = Number.isFinite(mentor.horas_acumuladas) ? mentor.horas_acumuladas : 0
                  const meta = Number.isFinite(mentor.meta_horas) && mentor.meta_horas > 0 ? mentor.meta_horas : 60
                  const pct = Math.min(100, Math.round((horas / meta) * 100))
                  const esAcreditado = horas >= meta

                  return (
                    <tr key={mentor.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-medium text-slate-400 text-center">
                        {index + 1}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{mentor.nombre}</span>
                          {esAcreditado && (
                            <span title="Servicio social completado">
                              <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 sm:hidden font-normal mt-0.5">
                          {mentor.especialidad}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 font-normal hidden sm:table-cell">
                        {mentor.especialidad}
                      </td>
                      <td className="px-5 py-3.5">
                        {renderRangoBadge(mentor.rango, horas)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {horas.toFixed(1)} h
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-2.5 justify-end">
                          <div className="w-20 sm:w-28 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                esAcreditado ? 'bg-emerald-600' : 'bg-slate-900'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span
                            className={`font-mono text-[11px] font-bold w-9 text-right ${
                              esAcreditado ? 'text-emerald-700' : 'text-slate-800'
                            }`}
                          >
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
