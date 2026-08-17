import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Rutas públicas que NUNCA requieren autenticación ni muestran bloqueos
const isPublicRoute = createRouteMatcher([
  '/',
  '/recursos(.*)',
  '/verify(.*)',
  '/demo(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Si no hay llaves de Clerk configuradas en .env.local, permitir paso a todo
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return NextResponse.next()
  }

  // Si la ruta es pública o es /demo, permitir paso sin bloqueo
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // En producción con llaves de Clerk configuradas, proteger rutas privadas
  await auth.protect()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|json|png|jpg|jpeg|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
