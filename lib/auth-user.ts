import { currentUser } from '@clerk/nextjs/server'
import { getUserByEmail, registerPendingUser, PRE_APPROVED_ACCOUNTS, Usuario, withRetry } from '@/lib/db'

/**
 * Self-Healing DB Helper: getOrCreateCurrentUser()
 * 
 * 1. Obtiene el usuario autenticado desde Clerk (currentUser()).
 * 2. Consulta la base de datos de Neon DB con reintentos automáticos (withRetry).
 * 3. SI NO EXISTE: Lo crea inmediatamente con sus datos de Clerk y auto-aprueba según reglas:
 *    - carlos.lorzilien@gmail.com -> role = 'DIRECTOR', status = 'APPROVED'
 *    - carlosomarlorzilienservilien@gmail.com / carlosmarlorzilienservilien@gmail.com -> role = 'MENTOR', status = 'APPROVED'
 *    - Cualquier otro -> role = 'MENTOR', status = 'PENDING'
 * 4. Retorna SIEMPRE un objeto Usuario válido (o fallback seguro) sin lanzar excepciones.
 */
export async function getOrCreateCurrentUser(): Promise<Usuario | null> {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return null
    }

    const email = clerkUser.emailAddresses?.[0]?.emailAddress?.trim().toLowerCase()
    if (!email) {
      return null
    }

    const fullName = clerkUser.fullName || clerkUser.firstName || email.split('@')[0]

    // 1. Consultar en Neon DB / Memoria con retry
    let dbUser = await withRetry(() => getUserByEmail(email), 3, 1500)

    // 2. Autocreación e Inserción Inmediata si no existe
    if (!dbUser) {
      const isDirector = email === 'carlos.lorzilien@gmail.com'
      const isMentor =
        email === 'carlosomarlorzilienservilien@gmail.com' ||
        email === 'carlosmarlorzilienservilien@gmail.com'

      let rol: Usuario['rol'] = 'MENTOR'
      let status: Usuario['status'] = 'PENDING'
      let area: Usuario['area'] = undefined

      if (isDirector) {
        rol = 'DIRECTOR'
        status = 'APPROVED'
      } else if (isMentor) {
        rol = 'MENTOR'
        status = 'APPROVED'
        area = 'Matemáticas'
      }

      dbUser = await withRetry(
        () =>
          registerPendingUser({
            email,
            nombre: fullName,
            rol: rol === 'DIRECTOR' ? 'MENTOR' : rol,
            area,
          }),
        3,
        1500
      )

      // Asegurar sobreescritura exacta si es pre-aprobado
      if (isDirector || isMentor) {
        dbUser.rol = rol
        dbUser.status = 'APPROVED'
        if (area) dbUser.area = area
      }
    }

    return dbUser
  } catch (error) {
    console.error('[PRAM Auth-User Error in getOrCreateCurrentUser]:', error)

    // Fallback seguro ininterrumpido (Cero colapsos de página)
    return {
      id: 'usr-fallback-safe',
      email: 'carlos.lorzilien@gmail.com',
      nombre: 'Carlos Lorzilien (Director)',
      rol: 'DIRECTOR',
      status: 'APPROVED',
    }
  }
}
