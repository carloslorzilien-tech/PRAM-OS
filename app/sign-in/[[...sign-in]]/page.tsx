import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Iniciar Sesión · PRAM OS',
  description: 'Accede al sistema de gestión pedagógica del Liceo Minerva Mirabal.',
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="mb-6 flex flex-col items-center gap-2">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#152642] p-2 shadow-sm transition-transform group-hover:scale-105">
            <img
              src="/pram-logo.svg"
              alt="PRAM Logo"
              className="size-full object-contain invert brightness-0 contrast-200"
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            PRAM OS
          </span>
        </Link>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
          Liceo Minerva Mirabal
        </span>
      </div>

      <div className="w-full max-w-md flex justify-center">
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
