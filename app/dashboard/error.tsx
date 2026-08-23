'use client'

import React from 'react'
import Link from 'next/link'
import { RefreshCw, LayoutDashboard } from 'lucide-react'

export default function DashboardErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-slate-900 font-sans">
      <div className="max-w-md w-full p-6 sm:p-8 bg-white rounded-xl border border-slate-200 shadow-sm text-center space-y-4">
        <div className="flex size-12 items-center justify-center rounded-xl bg-[#152642] p-2 mx-auto shadow-sm">
          <img
            src="/pram-logo.svg"
            alt="PRAM"
            className="size-full object-contain invert brightness-0 contrast-200"
          />
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900">
            Conexión Interrumpida en el Dashboard
          </h2>
          <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
            No se pudo conectar con el servidor en este momento. Haz clic en reintentar para cargar en Modo Seguro.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg px-4 py-2 text-xs font-medium shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className="size-3.5" />
            <span>Reintentar</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg px-4 py-2 text-xs font-medium transition-all"
          >
            <LayoutDashboard className="size-3.5" />
            <span>Volver al Inicio</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
