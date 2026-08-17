'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('PRAM OS Handled Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-slate-900 font-sans">
      <div className="max-w-md w-full p-6 sm:p-8 bg-white rounded-xl border border-slate-200 shadow-sm text-center space-y-4">
        <div className="flex size-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 mx-auto border border-amber-200">
          <AlertTriangle className="size-6" />
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900">
            Aviso de Recuperación del Sistema
          </h2>
          <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
            Se ha activado el mecanismo de protección de PRAM OS. Puedes reintentar la acción o volver al portal de impacto.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg px-4 py-2 text-xs font-medium shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className="size-3.5" />
            <span>Reintentar</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg px-4 py-2 text-xs font-medium transition-all"
          >
            <Home className="size-3.5" />
            <span>Ir al Inicio</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
