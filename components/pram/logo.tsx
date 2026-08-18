'use client'

import React from 'react'
import Image from 'next/image'

export function PramSymbol({ className = 'size-8' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <Image
        src="/pram-logo.svg"
        alt="PRAM M Logo"
        width={40}
        height={34}
        className="size-full object-contain drop-shadow-xs"
        priority
      />
    </div>
  )
}

export function LogoMark({
  className = 'size-9',
  boxClassName = 'bg-slate-900 text-white rounded-lg p-1.5 shadow-sm',
}: {
  className?: string
  boxClassName?: string
}) {
  return (
    <div className={`inline-flex items-center justify-center ${boxClassName}`}>
      <div className={`relative ${className}`}>
        <Image
          src="/pram-logo.svg"
          alt="PRAM Logo"
          width={36}
          height={31}
          className="size-full object-contain invert brightness-0 contrast-200"
          priority
        />
      </div>
    </div>
  )
}

export function LogoFull({
  className = '',
  symbolSize = 'size-8',
}: {
  className?: string
  symbolSize?: string
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex size-9 sm:size-10 items-center justify-center rounded-lg bg-slate-900 p-1.5 shadow-sm shrink-0">
        <Image
          src="/pram-logo.svg"
          alt="PRAM M Logo"
          width={36}
          height={31}
          className="size-full object-contain invert brightness-0 contrast-200"
          priority
        />
      </div>
      <div className="flex flex-col">
        <span className="text-base font-bold tracking-tight text-slate-900 leading-none">
          PRAM OS
        </span>
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight font-mono mt-0.5 leading-tight">
          Liceo Minerva Mirabal • Institucional
        </span>
      </div>
    </div>
  )
}

export function Logo({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  return <LogoFull className={className} />
}
