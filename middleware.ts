import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Rutas públicas que NUNCA requieren autenticación
const isPublicRoute = createRouteMatcher([
  '/',
  '/recursos(.*)',
  '/verify(.*)',
  '/demo(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api(.*)',
])

// Rutas restringidas solo a DIRECTOR y AREA_DIRECTOR
const isDirectorRoute = createRouteMatcher([
  '/dashboard/director(.*)',
])

// Roles con acceso a la vista de Director/Auditoría
const DIRECTOR_ROLES = ['DIRECTOR', 'AREA_DIRECTOR', 'org:director', 'org:area_director']

export default clerkMiddleware(async (auth, req) => {
  // Sin llaves de Clerk → modo autónomo local, permitir todo
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return NextResponse.next()
  }

  // Rutas públicas: libre acceso
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // Para rutas de director, verificar que el usuario tenga el rol adecuado
  if (isDirectorRoute(req)) {
    const { sessionClaims } = await auth()

    // Si no está autenticado, redirigir al sign-in
    if (!sessionClaims) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }

    // Verificar rol en publicMetadata o orgRole
    const role =
      (sessionClaims?.publicMetadata as { role?: string })?.role ||
      (sessionClaims as { orgRole?: string })?.orgRole ||
      ''

    if (!DIRECTOR_ROLES.some(r => role === r)) {
      // Usuario sin rol de director → redirigir al panel de mentor
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
