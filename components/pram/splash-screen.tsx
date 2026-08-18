'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  // Phase 0: Center (grande y centrado)
  // Phase 1: Moving (se escala y desplaza fluidamente a la izquierda)
  // Phase 2: Revealed (emerge PRAM a la derecha + subtítulo inferior)
  // Phase 3: Dissolve exit
  const [phase, setPhase] = useState<'center' | 'moving' | 'revealed' | 'exiting'>('center')

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setPhase('moving')
    }, 450)

    const timer2 = setTimeout(() => {
      setPhase('revealed')
    }, 1250)

    const timer3 = setTimeout(() => {
      setPhase('exiting')
    }, 2200)

    const timer4 = setTimeout(() => {
      onComplete()
    }, 2700)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [onComplete])

  const handleSkip = () => {
    setPhase('exiting')
    setTimeout(onComplete, 200)
  }

  const isMoved = phase === 'moving' || phase === 'revealed' || phase === 'exiting'
  const isRevealed = phase === 'revealed' || phase === 'exiting'

  return (
    <div
      onClick={handleSkip}
      className={cn(
        'fixed inset-0 z-50 flex flex-col justify-between bg-[#0F172A] p-6 sm:p-8 text-white select-none transition-opacity duration-500 cursor-pointer',
        phase === 'exiting' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      )}
      role="banner"
      aria-label="PRAM Cargando"
    >
      {/* Grid Pattern Sutil Técnico de Fondo */}
      <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Barra de progreso superior */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
        <div
          className="h-full bg-blue-500 transition-all duration-[2200ms] ease-linear"
          style={{ width: phase === 'exiting' ? '100%' : phase === 'revealed' ? '85%' : phase === 'moving' ? '40%' : '15%' }}
        />
      </div>

      {/* Contenedor Principal con Logo Animado Responsivo */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {/* Contenedor del Logo M + Texto */}
        <div
          className={cn(
            'absolute transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center',
            isMoved
              ? 'top-4 left-4 sm:top-5 sm:left-6 translate-x-0 translate-y-0'
              : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
          )}
        >
          {/* Ícono M Estilizado (Minerva) */}
          <div
            className={cn(
              'flex items-center justify-center bg-[#152642] text-white transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-2xl border border-slate-700 shadow-2xl shrink-0',
              isMoved
                ? 'w-11 h-11 sm:w-12 sm:h-12 p-2'
                : 'w-24 h-24 sm:w-32 sm:h-32 p-4 scale-100'
            )}
          >
            <svg
              viewBox="0 0 363 312"
              fill="currentColor"
              className="w-full h-full text-white"
            >
              <path
                d="M199,193 L198,193 L189,203 L189,204 L186,207 L186,209 L182,212 L182,214 L173,222 L173,223 L168,228 L168,229 L161,236 L159,237 L151,229 L151,227 L148,224 L146,224 L145,223 L145,221 L143,219 L141,219 L135,224 L135,226 L134,227 L132,227 L132,228 L119,243 L119,246 L129,260 L130,263 L142,280 L143,283 L145,285 L155,301 L199,301 L199,288 L201,287 L201,282 L199,281 L201,280 L201,279 L199,278 L199,256 L201,255 L201,254 L199,253 L199,251 L201,250 L201,249 L199,248 L199,210 L201,209 L201,207 L199,206 L201,205 L201,202 L199,201 Z M308,111 L305,112 L299,118 L273,149 L273,151 L268,155 L268,157 L260,164 L256,171 L256,299 L257,301 L306,301 L306,297 L308,296 L308,276 L306,275 L308,273 L308,270 L306,269 L308,267 L308,261 L306,260 L308,259 L308,252 L306,251 L308,250 L308,247 L306,246 L308,245 L308,228 L306,227 L308,225 L308,212 L306,211 L308,210 L308,204 L306,203 L308,202 L308,196 L306,195 L308,194 L308,191 L306,190 L308,188 L308,179 L306,178 L306,175 L308,174 L308,172 L306,171 L308,170 L308,164 L306,163 L308,162 L308,155 L306,154 L308,153 L308,145 L306,144 L306,132 L308,131 Z M67,82 L13,82 L13,281 L15,281 L17,279 L17,277 L20,276 L40,252 L40,250 L46,245 L47,242 L49,242 L65,223 L65,168 L66,167 L84,194 L86,196 L88,196 L114,166 L114,164 L119,160 L115,156 L115,154 L111,150 L111,147 L99,129 L95,126 L95,124 L93,123 L93,121 L87,114 L87,111 L83,105 L79,102 L79,99 L73,90 L69,87 Z M352,15 L349,14 L301,31 L275,37 L274,39 L295,58 L237,128 L232,130 L212,111 L159,174 L142,157 L138,156 L19,294 L16,301 L65,301 L65,288 L140,201 L158,218 L162,218 L214,157 L236,175 L319,77 L342,95 L342,79 L344,78 L343,71 L347,58 L346,50 L348,49 Z"
                fillRule="nonzero"
              />
            </svg>
          </div>

          {/* Letras P R A M y Subtítulo */}
          <div
            className={cn(
              'ml-3 sm:ml-4 flex flex-col justify-center transition-all duration-500 ease-out',
              isRevealed
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-4 pointer-events-none'
            )}
          >
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-[0.2em] text-white uppercase font-sans">
                P R A M
              </h1>
              <span className="rounded-md bg-[#152642] border border-slate-600 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-300">
                v3.2
              </span>
            </div>

            <p className="mt-0.5 text-[11px] sm:text-xs font-medium tracking-tight text-[#94A3B8]">
              Programa de Refuerzo Académico Minerva Mirabal
            </p>
          </div>
        </div>

        {/* Mensaje inferior */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 inline-block animate-ping" />
            <span>Iniciando Entorno Académico Institucional...</span>
          </div>
          <span className="text-slate-500 hover:text-slate-300 underline uppercase tracking-widest text-[10px]">
            Presiona para entrar →
          </span>
        </div>
      </div>
    </div>
  )
}
