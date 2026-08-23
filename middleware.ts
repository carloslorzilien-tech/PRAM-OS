import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Rutas 100% públicas — Libre acceso sin bloqueos ni avisos
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

export default clerkMiddleware(async (auth, req) => {
  // Sin llaves de Clerk → modo autónomo local, permitir todo sin avisos
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return NextResponse.next()
  }

  // Rutas públicas: libre acceso
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  const pathname = req.nextUrl.pathname

  // Blindaje Anti-Bucle: Si la solicitud ya se dirige a un dashboard, permitir el paso.
  // La verificación de rol y DB se delega exclusivamente a los Server Components sin rebotes circulares.
  if (
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/mentor') ||
    pathname.startsWith('/dashboard/director') ||
    pathname.startsWith('/solicitud-pendiente')
  ) {
    await auth.protect()
    return NextResponse.next()
  }

  // Resto de rutas protegidas
  await auth.protect()
  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|json|png|jpg|jpeg|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
