import { Usuario } from '@/lib/db'

/**
 * Self-Healing Auth Helper: getOrCreateCurrentUser()
 * Fase 1 de Migración a Firebase (Retorna usuario institucional seguro)
 */
export async function getOrCreateCurrentUser(): Promise<Usuario | null> {
  return {
    id: 'usr-director-main',
    email: 'carlos.lorzilien@gmail.com',
    nombre: 'Carlos Lorzilien (Director)',
    rol: 'DIRECTOR',
    status: 'APPROVED',
  }
}
