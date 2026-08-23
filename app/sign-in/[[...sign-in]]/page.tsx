import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

export const metadata = {
  title: 'Iniciar Sesión · PRAM OS',
  description: 'Accede al sistema de gestión pedagógica del Liceo Minerva Mirabal.',
}

export default async function SignInPage() {
  try {
    const { userId } = await auth()
    if (userId) {
      redirect('/dashboard')
    }
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_REDIRECT') || error?.message?.includes('NEXT_REDIRECT')) {
      throw error
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Header Institucional */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#152642] p-2.5 shadow-md transition-transform group-hover:scale-105">
            <img
              src="/pram-logo.svg"
              alt="PRAM Logo"
              className="size-full object-contain invert brightness-0 contrast-200"
            />
          </div>
          <div className="text-left">
            <span className="text-2xl font-bold tracking-tight text-slate-900 block leading-tight">
              PRAM OS
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 font-mono block">
              Liceo Minerva Mirabal
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-600 shadow-xs">
          <ShieldCheck className="size-3 text-emerald-500" />
          <span>Autenticación Institucional Segura</span>
        </div>
      </div>

      {/* Widget de Clerk con tema PRAM */}
      <div className="w-full max-w-md">
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/dashboard"
        />
      </div>

      <div className="mt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors"
        >
          <ArrowLeft className="size-3" />
          Volver al Portal Público
        </Link>
      </div>
    </div>
  )
}
