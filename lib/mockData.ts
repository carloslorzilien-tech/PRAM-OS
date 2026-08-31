// lib/mockData.ts
// PRAM OS — Estado Cero / Baseline Limpio

import {
  Estudiante,
  Mentor,
  Sesion,
  ExamenDiagnostico,
  Supervisor,
  SolicitudRefuerzo,
} from '@/types/pram'

export const mockSupervisores: Supervisor[] = [
  {
    id: 'sup-1',
    nombre: 'Dirección del Liceo Minerva Mirabal',
    area: 'Matemáticas',
    codigo_acceso: 'DIR-2026',
  },
]

export const mockMentores: Mentor[] = []
export const mockEstudiantes: Estudiante[] = []
export const mockSesiones: Sesion[] = []
export const mockSolicitudes: SolicitudRefuerzo[] = []
export const mockExamenes: ExamenDiagnostico[] = []

