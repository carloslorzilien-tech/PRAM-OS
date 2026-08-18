// types/pram.ts
// PRAM SYSTEM SPECIFICATION (VERSION 3.2 RBAC) - Programa de Refuerzo Académico Minerva Mirabal

export type GradoSecundaria = '3ro' | '4to';

export type NivelDominio = 1 | 2 | 3 | 4 | 5;

export type RangoEstudiante = 'Novato' | 'Aspirante' | 'Avanzado' | 'Élite';

export type MentorRango = 'Junior' | 'Senior' | 'Head';

export type UserRole = 'guest' | 'estudiante' | 'mentor_junior' | 'head_mentor' | 'director';

export type AreaSupervision = 'Matemáticas' | 'Lengua Española' | 'General';

export type EstadoSesion = 
  | 'Programada' 
  | 'Completada' 
  | 'Ausente_Injustificado' 
  | 'Ausente_Justificado';

export type EstadoAuditoria = 'Pendiente' | 'Aprobado_Institucional' | 'Aprobado_MINERD' | 'Rechazado';

export type TipoExamen = 'Pre-Test' | 'Checkpoint' | 'Post-Test';

export type VariantePrueba = 'A' | 'B' | 'C';

export interface Supervisor {
  id: string;
  nombre: string;
  area: AreaSupervision;
  codigo_acceso: string;
}

export interface Estudiante {
  id: string;
  nombre: string;
  pin: string; // PIN de 4 dígitos para Interfaz Nómada
  grado: GradoSecundaria;
  liceo_seccion: string;
  nivel_actual: NivelDominio; // 1-5 basado en rúbrica de dominio
  mentor_id: string; // FK Mentor
  nivel_pretest?: NivelDominio;
  nivel_posttest?: NivelDominio;
  puntos_ranking?: number;
  racha_asistencia?: number; // Conteo de sesiones consecutivas asistidas
  graduado_pram?: boolean; // Autorizado por Dirección
}

export interface Mentor {
  id: string;
  nombre: string;
  rango: MentorRango;
  horas_acumuladas: number; // Conteo para acreditación de servicio social
  avatar?: string;
  especialidad?: string;
  supervisor_id?: string;
  puntos_ranking?: number;
}

export interface CurrentUser {
  id: string;
  email: string;
  nombre: string;
  role: UserRole;
  estudianteData?: Estudiante;
  mentorData?: Mentor;
  supervisorData?: Supervisor;
}

export interface Sesion {
  id: string;
  estudiante_id: string;
  mentor_id: string;
  tema: string;
  materia: string;
  fecha_programada: string;
  duracion_minutos: number;
  estado: EstadoSesion;
  confirmacion_mentor: boolean;
  confirmacion_estudiante: boolean;
  validado_por_auditoria: boolean;
  estado_auditoria: EstadoAuditoria;
  supervisor_id?: string;
  notas: string;
}

export interface ExamenDiagnostico {
  id: string;
  estudiante_id: string;
  tipo: TipoExamen;
  variante: VariantePrueba;
  fecha: string;
  resultado_nivel: NivelDominio; // 1-5
  ai_analysis_summary: string; // Resumen de debilidades detectadas
  foto_url: string; // Respaldo físico
  respuestas_detectadas?: Record<string, string>;
}

export interface SolicitudRefuerzo {
  id: string;
  estudiante_id: string;
  tema: string;
  materia: string;
  fecha_solicitud: string;
  estado: 'Pendiente' | 'Asignada';
}

export interface MentorRankingItem {
  mentor: Mentor;
  horas: number;
  delta_promedio: number;
  score: number; // (Horas * 10) + (Delta_Promedio * 50)
  estudiantes_count: number;
}

export interface EstudianteRankingItem {
  estudiante: Estudiante;
  delta_nivel: number;
  racha: number;
  score: number; // (Delta_Nivel * 100) + (Racha * 15)
  rango: RangoEstudiante;
}
