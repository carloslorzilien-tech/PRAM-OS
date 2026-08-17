'use client'

import React from 'react'
import { Printer } from 'lucide-react'

export function PrintCertificateButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg px-3 py-1.5 text-xs font-medium transition-all shadow-xs cursor-pointer"
    >
      <Printer className="size-3.5 text-slate-600" />
      <span>Imprimir / PDF</span>
    </button>
  )
}
