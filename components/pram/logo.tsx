'use client'

import React from 'react'
import Image from 'next/image'

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={
        'inline-flex items-center justify-center p-1 ' +
        (className ?? 'size-9')
      }
    >
      <Image
        src="/pram-logo.svg"
        alt="PRAM Logo"
        width={36}
        height={36}
        className="size-full object-contain"
        priority
      />
    </span>
  )
}

export function LogoFull({ className }: { className?: string }) {
  return (
    <div className={'flex items-center gap-3 ' + (className ?? '')}>
      <Image
        src="/pram-logo.svg"
        alt="PRAM Logo"
        width={36}
        height={36}
        className="size-9 object-contain shrink-0"
        priority
      />
      <div className="flex flex-col">
        <span className="text-base font-black tracking-widest text-[#152642] uppercase font-sans">
          PRAM
        </span>
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight font-mono">
          Programa Minerva Mirabal
        </span>
      </div>
    </div>
  )
}

export function Logo({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizeClass =
    size === 'sm' ? 'size-7' : size === 'lg' ? 'size-12' : 'size-9'
  return <LogoFull className={className} />
}
