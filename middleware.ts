import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Rutas 100% públicas — Libre acceso sin avisos, 403 ni bloqueos erróneos
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/recursos(.*)',
  '/verify(.*)',
  '/validar(.*)',
  '/demo(.*)',
  '/rankings(.*)',
  '/onboarding(.*)',
  '/solicitud-pendiente(.*)',
  '/api(.*)',
])

// Rutas restringidas solo a DIRECTOR y AREA_DIRECTOR
const isDirectorRoute = createRouteMatcher([
  '/dashboard/director(.*)',
])

const DIRECTOR_ROLES = ['DIRECTOR', 'AREA_DIRECTOR', 'org:director', 'org:area_director']

export default clerkMiddleware(async (auth, req) => {
  // Sin llaves de Clerk → modo autónomo local, permitir todo sin avisos
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return NextResponse.next()
  }

  // Rutas públicas: libre acceso sin ningún aviso ni bloqueo
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // Rutas de director: verificar rol
  if (isDirectorRoute(req)) {
    const { sessionClaims } = await auth()

    if (!sessionClaims) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }

    const role =
      (sessionClaims?.publicMetadata as { role?: string })?.role ||
      (sessionClaims as { orgRole?: string })?.orgRole ||
      ''

    if (!DIRECTOR_ROLES.some(r => role === r)) {
      return NextResponse.redirect(new URL('/dashboard/mentor', req.url))
    }

    return NextResponse.next()
  }

  // Resto de rutas privadas → solo requieren estar autenticado
  await auth.protect()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|json|png|jpg|jpeg|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
