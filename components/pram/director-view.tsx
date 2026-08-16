'use client'

import React, { useState } from 'react'
import {
  ShieldAlert,
  Award,
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Building2,
  Clock,
  ShieldCheck,
  GraduationCap,
  ArrowRightLeft,
  CheckCheck,
  Download,
} from 'lucide-react'
import { usePram } from '@/lib/pram-context'
import { cn } from '@/lib/utils'

export function DirectorView() {
  const {
    getRankingMentores,
    getSesionesPendientesAuditoria,
    aprobarAuditoriaManual,
    aprobarAuditoriaMasiva,
    rechazarAuditoria,
    reasignarMentorEstudiante,
    autorizarGraduacionPram,
    getEstudianteById,
    getMentorById,
    getEstudiantesPorNivel,
    estudiantes,
    mentores,
    sesiones,
    supervisores,
    requireAuth,
  } = usePram()

  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([])
  const [selectedStudentForReassign, setSelectedStudentForReassign] = useState<string | null>(null)
  const [targetMentorId, setTargetMentorId] = useState<string>(mentores[0]?.id || '')
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const ranking = getRankingMentores()
  const pendientesAuditoria = getSesionesPendientesAuditoria()
  const niveles = getEstudiantesPorNivel()
  const supervisor = supervisores[0] || { nombre: 'Dra. Carmen Batlle', area: 'Matemáticas' }

  const totalHorasAuditadas = sesiones
    .filter((s) => s.estado_auditoria === 'Aprobado_MINERD' || s.validado_por_auditoria)
    .reduce((acc, s) => acc + s.duracion_minutos / 60, 0)

  let totalDelta = 0
  estudiantes.forEach((e) => {
    totalDelta += (e.nivel_actual - (e.nivel_pretest || 2))
  })
  const deltaPromedioGeneral = estudiantes.length > 0 ? (totalDelta / estudiantes.length).toFixed(1) : '1.3'

  const handleToggleSelectSession = (id: string) => {
    setSelectedSessionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSelectAllPending = () => {
    if (selectedSessionIds.length === pendientesAuditoria.length) {
      setSelectedSessionIds([])
    } else {
      setSelectedSessionIds(pendientesAuditoria.map((s) => s.id))
    }
  }

  const handleAprobarMasivo = () => {
    requireAuth('aprobar sesiones masivamente como Director', async () => {
      if (selectedSessionIds.length === 0) return
      await aprobarAuditoriaMasiva(selectedSessionIds)
      setSuccessMsg(`¡${selectedSessionIds.length} sesiones aprobadas oficialmente para el MINERD!`)
      setSelectedSessionIds([])
      setTimeout(() => setSuccessMsg(null), 3000)
    })
  }

  const handleAprobarIndividual = (id: string) => {
    requireAuth('auditar sesión ministerial', async () => {
      await aprobarAuditoriaManual(id)
      setSuccessMsg('Sesión auditada y validada para servicio social.')
      setTimeout(() => setSuccessMsg(null), 2500)
    })
  }

  const handleRechazarIndividual = (id: string) => {
    requireAuth('rechazar sesión por discrepancia', async () => {
      await rechazarAuditoria(id)
      setSuccessMsg('Sesión rechazada por discrepancia en asistencia.')
      setTimeout(() => setSuccessMsg(null), 2500)
    })
  }

  const handleGraduar = (id: string, nombre: string) => {
    requireAuth('autorizar certificado de Graduación PRAM', async () => {
      await autorizarGraduacionPram(id)
      setSuccessMsg(`¡Certificado de Graduación PRAM emitido con éxito para ${nombre}!`)
      setTimeout(() => setSuccessMsg(null), 3000)
    })
  }

  const handleEjecutarReasignacion = () => {
    requireAuth('reasignar mentor titular', async () => {
      if (!selectedStudentForReassign) return
      await reasignarMentorEstudiante(selectedStudentForReassign, targetMentorId)
      setSuccessMsg('Mentor reasignado exitosamente.')
      setSelectedStudentForReassign(null)
      setTimeout(() => setSuccessMsg(null), 2500)
    })
  }

  const handleExportMINERD = () => {
    requireAuth('exportar reportes certificados MINERD', () => {
      alert(
        `[CERTIFICACIÓN MINERD]\n\nGenerando expediente oficial en PDF/Excel:\n- Área: ${supervisor.area}\n- Supervisor: ${supervisor.nombre}\n- Total Horas Validadas: ${totalHorasAuditadas.toFixed(1)} h\n- Cohorte: ${estudiantes.length} alumnos\n\nListo para firma y sello oficial.`
      )
    })
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-8">
      {/* 1. Encabezado Institucional Dirección MINERD */}
      <section className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-[#152642] text-white shadow-md">
            <Building2 className="size-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-slate-900">
                {supervisor.nombre}
              </h2>
              <span className="rounded-full bg-[#152642]/10 px-2.5 py-0.5 text-xs font-bold text-[#152642]">
                Directora de Área · {supervisor.area}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Supervisión de Cohortes · Validación Dual · Lic. Minerva Mirabal
            </p>
          </div>
        </div>

        {/* Botón Exportación MINERD */}
        <button
          type="button"
          onClick={handleExportMINERD}
          className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#152642] px-5 text-xs font-bold text-white shadow-md transition-all hover:bg-[#152642]/90 active:scale-[0.98] cursor-pointer self-start sm:self-auto"
        >
          <Download className="size-4" />
          <span>EXPORTAR REPORTE MINERD</span>
        </button>
      </section>

      {/* Mensaje de Acción Exitosa */}
      {successMsg && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 2. Tarjetas de Métricas Globales del Área */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">
              Horas Auditadas
            </span>
            <Clock className="size-4 text-[#152642]" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {totalHorasAuditadas.toFixed(1)} h
          </p>
          <p className="text-[11px] font-semibold text-emerald-600 mt-1">
            Validadas para MINERD
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">
              Delta Cohorte
            </span>
            <TrendingUp className="size-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">
            +{deltaPromedioGeneral} Δ
          </p>
          <p className="text-[11px] font-semibold text-slate-400 mt-1">
            Crecimiento promedio
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">
              Estudiantes
            </span>
            <Users className="size-4 text-[#152642]" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {estudiantes.length}
          </p>
          <p className="text-[11px] font-semibold text-blue-600 mt-1">
            Activos en Refuerzo
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">
              Por Auditar
            </span>
            <ShieldAlert className="size-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {pendientesAuditoria.length}
          </p>
          <p className="text-[11px] font-semibold text-amber-600 mt-1">
            Pendientes de firma
          </p>
        </div>
      </section>

      {/* 3. Panel Exclusivo de Auditoría de Sesiones */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-black uppercase tracking-tight text-slate-900">
              Auditoría Ejecutiva de Horas de Servicio Social
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Aprueba o rechaza con 1 clic las sesiones cargadas por los mentores
            </p>
          </div>

          {pendientesAuditoria.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllPending}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {selectedSessionIds.length === pendientesAuditoria.length ? 'Deseleccionar' : 'Seleccionar Todo'}
              </button>

              <button
                type="button"
                onClick={handleAprobarMasivo}
                disabled={selectedSessionIds.length === 0}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-40 transition-all cursor-pointer"
              >
                <CheckCheck className="size-3.5" />
                <span>Aprobar para MINERD ({selectedSessionIds.length})</span>
              </button>
            </div>
          )}
        </div>

        {pendientesAuditoria.length === 0 ? (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="size-6 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm">¡Bandeja de auditoría al día!</p>
              <p className="text-xs font-medium text-emerald-700 mt-0.5">Todas las sesiones cuentan con validación y firma ministerial.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {pendientesAuditoria.map((sesion) => {
              const estudiante = getEstudianteById(sesion.estudiante_id)
              const mentor = getMentorById(sesion.mentor_id)
              const isSelected = selectedSessionIds.includes(sesion.id)

              return (
                <div
                  key={sesion.id}
                  className={cn(
                    'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border p-4 transition-all',
                    isSelected ? 'border-[#152642] bg-slate-50' : 'border-slate-200 bg-white'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectSession(sesion.id)}
                      className="mt-1 size-4 rounded-md accent-[#152642] cursor-pointer"
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          {sesion.tema}
                        </h4>
                        <span className="rounded-full bg-slate-100 px-2 py-0.2 text-[10px] font-bold text-slate-600">
                          {sesion.duracion_minutos} min ({(sesion.duracion_minutos / 60).toFixed(1)} h)
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Mentor: <strong>{mentor?.nombre}</strong> · Estudiante: <strong>{estudiante?.nombre}</strong> · {sesion.fecha_programada}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleAprobarIndividual(sesion.id)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 text-xs font-bold text-white hover:bg-emerald-700 transition-all active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <CheckCircle2 className="size-3.5" />
                      <span>Aprobar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRechazarIndividual(sesion.id)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-600 hover:bg-red-100 transition-all active:scale-95 cursor-pointer"
                    >
                      <XCircle className="size-3.5" />
                      <span>Rechazar</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* 4. Gestión de Cohortes y Graduación PRAM */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-black uppercase tracking-tight text-slate-900">
            Gestión de Cohortes & Graduación PRAM
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Reasignación de mentores titulares y autorización de certificados de culminación
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {estudiantes.map((est) => {
            const mentorAsignado = getMentorById(est.mentor_id)
            const nivelSuperado = est.nivel_actual >= 4

            return (
              <div
                key={est.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {est.nombre}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Grado {est.grado} · Nivel Actual: <strong className="text-slate-800">{est.nivel_actual}.0</strong>
                      </p>
                    </div>

                    {est.graduado_pram ? (
                      <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-bold">
                        Graduado PRAM ✓
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-bold">
                        Activo
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mt-2">
                    Mentor: <strong className="text-slate-900">{mentorAsignado?.nombre || 'Sin asignar'}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      requireAuth('reasignar mentor', () => {
                        setSelectedStudentForReassign(est.id)
                      })
                    }}
                    className="flex-1 inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <ArrowRightLeft className="size-3" />
                    <span>Reasignar</span>
                  </button>

                  {!est.graduado_pram && (
                    <button
                      type="button"
                      onClick={() => handleGraduar(est.id, est.nombre)}
                      className={cn(
                        'flex-1 inline-flex h-8 items-center justify-center gap-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-2xs',
                        nivelSuperado
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-[#152642] text-white hover:bg-[#152642]/90'
                      )}
                    >
                      <GraduationCap className="size-3.5" />
                      <span>Autorizar Graduación</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Modal de Reasignación de Mentor */}
      {selectedStudentForReassign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h4 className="text-base font-black text-slate-900">
              Reasignar Mentor
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Selecciona el nuevo mentor titular para el estudiante:
            </p>

            <select
              value={targetMentorId}
              onChange={(e) => setTargetMentorId(e.target.value)}
              className="mt-4 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-800 outline-none"
            >
              {mentores.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre} ({m.rango})
                </option>
              ))}
            </select>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedStudentForReassign(null)}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEjecutarReasignacion}
                className="flex-1 rounded-xl bg-[#152642] py-2 text-xs font-bold text-white hover:bg-[#152642]/90 cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
