import React from 'react'
import Link from 'next/link'
import { FileQuestion, ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-slate-900 font-sans">
      <div className="max-w-md w-full p-6 sm:p-8 bg-white rounded-xl border border-slate-200 shadow-sm text-center space-y-4">
        <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-700 mx-auto border border-slate-200">
          <FileQuestion className="size-6" />
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900">
            Página o Registro no Encontrado
          </h2>
          <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
            La ruta o documento solicitado no está disponible en la plataforma PRAM OS.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg px-4 py-2 text-xs font-medium shadow-sm transition-all"
          >
            <Home className="size-3.5" />
            <span>Volver al Portal Principal</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
