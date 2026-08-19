'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  BookOpen,
  ShieldCheck,
  Menu,
  X,
  LogIn,
  UserPlus,
} from 'lucide-react'
import { Google1ClickButton } from '@/components/pram/google-1click-auth'

export function MainNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-8">
      {/* Isotipo con la 'M' de PRAM + Marca Principal */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="flex size-9 sm:size-10 items-center justify-center rounded-lg bg-slate-900 p-1.5 shadow-sm shrink-0 transition-transform group-hover:scale-105">
          <Image
            src="/pram-logo.svg"
            alt="PRAM M Logo"
            width={36}
            height={31}
            className="size-full object-contain invert brightness-0 contrast-200"
            priority
          />
        </div>
        <div>
          <span className="text-base font-bold tracking-tight text-slate-900 block leading-none">
            PRAM OS
          </span>
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-tight font-mono block leading-tight mt-0.5">
            Liceo Minerva Mirabal
          </span>
        </div>
      </Link>

      {/* Navegación Desktop */}
      <nav className="hidden md:flex items-center gap-2 lg:gap-3">
        <Link
          href="/recursos"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
        >
          <BookOpen className="size-3.5 text-slate-500" />
          <span>Recursos</span>
        </Link>

        <Link
          href="/verify/PRAM-2026-M01-8841"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
        >
          <ShieldCheck className="size-3.5 text-slate-500" />
          <span>Verificar CUV</span>
        </Link>

        {/* Botón Iniciar Sesión 1-Click con Google */}
        <Google1ClickButton mode="sign-in">
          <LogIn className="size-3.5 text-slate-600" />
          <span>Iniciar Sesión</span>
        </Google1ClickButton>

        {/* Botón Registrarse 1-Click con Google */}
        <Google1ClickButton mode="sign-up">
          <UserPlus className="size-3.5 text-slate-200" />
          <span>Registrarse</span>
        </Google1ClickButton>
      </nav>

      {/* Botón Menú Móvil */}
      <button
        type="button"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        aria-label="Abrir Menú"
      >
        {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {/* Desplegable Móvil */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white border-b border-slate-200 p-4 shadow-lg md:hidden flex flex-col gap-2 z-40 animate-in fade-in slide-in-from-top-2 duration-200">
          <Link
            href="/recursos"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <BookOpen className="size-4 text-slate-500" />
            <span>Biblioteca de Recursos & Plantillas</span>
          </Link>

          <Link
            href="/verify/PRAM-2026-M01-8841"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <ShieldCheck className="size-4 text-slate-500" />
            <span>Validador de Certificados CUV</span>
          </Link>

          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
            <Google1ClickButton
              mode="sign-in"
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200 cursor-pointer"
            >
              <LogIn className="size-4" />
              <span>Iniciar Sesión</span>
            </Google1ClickButton>

            <Google1ClickButton
              mode="sign-up"
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg bg-[#152642] text-white text-xs font-semibold shadow-sm cursor-pointer"
            >
              <UserPlus className="size-4" />
              <span>Registrarse</span>
            </Google1ClickButton>
          </div>
        </div>
      )}
    </header>
  )
}
