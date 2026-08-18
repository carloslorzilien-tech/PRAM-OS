'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // No mostrar si ya fue instalada o descartada antes
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      sessionStorage.getItem('pram-install-dismissed') === 'true'
    ) {
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Espera 3 segundos antes de mostrar para no interrumpir al usuario
      setTimeout(() => setVisible(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setVisible(false)
  }

  const handleDismiss = () => {
    setVisible(false)
    setDismissed(true)
    sessionStorage.setItem('pram-install-dismissed', 'true')
  }

  if (!visible || dismissed) return null

  return (
    <div
      role="banner"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-md">
        {/* Isotipo PRAM */}
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 p-1.5">
          <img
            src="/pram-logo.svg"
            alt="PRAM Logo"
            className="size-full object-contain invert brightness-0 contrast-200"
          />
        </div>

        {/* Texto */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-900 leading-tight truncate">
            Instalar PRAM OS
          </p>
          <p className="text-[10px] text-slate-500 font-normal leading-tight mt-0.5">
            Acceso rápido sin abrir el navegador
          </p>
        </div>

        {/* Botón instalar */}
        <button
          type="button"
          onClick={handleInstall}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Download className="size-3" />
          <span>Instalar</span>
        </button>

        {/* Botón cerrar */}
        <button
          type="button"
          onClick={handleDismiss}
          className="flex size-7 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Cerrar"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
