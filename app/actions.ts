'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  createSessionInDb,
  approveSessionInDb,
  rejectSessionInDb,
  registerPendingUser,
  Sesion,
  MateriaValida,
} from '@/lib/db'

export async function submitSessionAction(formData: FormData) {
  const mentorId = formData.get('mentor_id') as string || 'm-1'
  const materia = formData.get('materia') as Sesion['materia']
  const tema = formData.get('tema') as string
  const duracionMinutos = Number(formData.get('duracion_minutos') || 45)
  const cantidadAlumnos = Number(formData.get('cantidad_alumnos') || 1)
  const fechaSesion = (formData.get('fecha_sesion') as string) || new Date().toISOString().split('T')[0]
  const notas = (formData.get('notas') as string) || ''

  if (!tema || !materia) {
    return { success: false, error: 'Por favor complete todos los campos requeridos.' }
  }

  try {
    await createSessionInDb({
      mentor_id: mentorId,
      materia,
      tema,
      duracion_minutos: duracionMinutos,
      cantidad_alumnos: cantidadAlumnos,
      fecha_sesion: fechaSesion,
      notas,
    })

    revalidatePath('/dashboard/mentor')
    revalidatePath('/dashboard/director')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error submitting session:', error)
    return { success: false, error: 'Error al registrar la sesión en la base de datos.' }
  }
}

export async function approveSessionAction(sessionId: string) {
  try {
    await approveSessionInDb(sessionId, 'Dra. Carmen Batlle')
    revalidatePath('/dashboard/director')
    revalidatePath('/dashboard/mentor')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error approving session:', error)
    return { success: false, error: 'Error al aprobar la sesión.' }
  }
}

export async function rejectSessionAction(sessionId: string) {
  try {
    await rejectSessionInDb(sessionId)
    revalidatePath('/dashboard/director')
    revalidatePath('/dashboard/mentor')
    return { success: true }
  } catch (error) {
    console.error('Error rejecting session:', error)
    return { success: false, error: 'Error al rechazar la sesión.' }
  }
}

export async function submitOnboardingAction(formData: FormData) {
  const email = (formData.get('email') as string) || ''
  const nombre = (formData.get('nombre') as string) || ''
  const rol = (formData.get('rol') as 'MENTOR' | 'STUDENT') || 'STUDENT'
  const grado = (formData.get('grado') as string) || ''
  const rawArea = (formData.get('area') as string) || 'Matemáticas'
  const area: MateriaValida = rawArea === 'Lengua Española' ? 'Lengua Española' : 'Matemáticas'

  if (!email || !email.includes('@')) {
    return { success: false, error: 'Por favor ingresa un correo electrónico válido.' }
  }

  try {
    await registerPendingUser({
      email,
      nombre,
      rol,
      grado: rol === 'STUDENT' ? grado : undefined,
      area: rol === 'MENTOR' ? area : undefined,
    })

    revalidatePath('/solicitud-pendiente')
    revalidatePath('/onboarding')
  } catch (error) {
    console.error('Error in submitOnboardingAction:', error)
    return { success: false, error: 'Error al registrar la solicitud.' }
  }

  redirect('/solicitud-pendiente')
}
