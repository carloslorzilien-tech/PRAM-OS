/**
 * PRAM OS — Role Types & Access Control
 * Sistema de Roles para Gestión Pedagógica Institucional
 *
 * Jerarquía de Roles:
 *   DIRECTOR        → Acceso total: auditoría, bloqueo, reportes, firma institucional
 *   AREA_DIRECTOR   → Acceso a auditoría y firma, sin configuración global
 *   MENTOR          → Registro de sesiones, progreso personal hacia las 60h
 *   STUDENT         → Vista de historial académico personal (futuro)
 */

export type UserRole = 'DIRECTOR' | 'AREA_DIRECTOR' | 'MENTOR' | 'STUDENT'

export const ROLE_LABELS: Record<UserRole, string> = {
  DIRECTOR: 'Director(a) Académico/a',
  AREA_DIRECTOR: 'Director(a) de Área',
  MENTOR: 'Tutor / Mentor Académico',
  STUDENT: 'Estudiante',
}

export const ROLE_BADGE_STYLES: Record<UserRole, string> = {
  DIRECTOR:
    'bg-slate-900 text-white border-slate-800',
  AREA_DIRECTOR:
    'bg-indigo-950 text-white border-indigo-900',
  MENTOR:
    'bg-emerald-50 text-emerald-700 border-emerald-200',
  STUDENT:
    'bg-slate-100 text-slate-600 border-slate-200',
}

/** Roles que pueden acceder al Panel de Dirección y Auditoría */
export const DIRECTOR_ROLES: UserRole[] = ['DIRECTOR', 'AREA_DIRECTOR']

/** Comprueba si un role tiene permisos de auditoría */
export function canAudit(role?: string | null): boolean {
  return DIRECTOR_ROLES.includes(role as UserRole)
}

/** Comprueba si un role puede registrar sesiones */
export function canRegisterSessions(role?: string | null): boolean {
  return ['DIRECTOR', 'AREA_DIRECTOR', 'MENTOR'].includes(role as UserRole)
}
