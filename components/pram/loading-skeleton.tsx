'use client'

import React from 'react'
import { cn } from '@/lib/utils'

function Pulse({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-xl bg-slate-200/80', className)} />
  )
}

export function LoadingSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 pt-2">
      {/* Header skeleton */}
      <div className="flex flex-col items-center gap-2">
        <Pulse className="h-5 w-40 rounded-full" />
        <Pulse className="h-7 w-64" />
        <Pulse className="h-4 w-48" />
      </div>

      {/* Card skeleton 1 */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <Pulse className="size-12 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Pulse className="h-5 w-48" />
            <Pulse className="h-3 w-32" />
          </div>
        </div>
        <Pulse className="h-10 w-full rounded-2xl" />
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Pulse key={i} className="h-8 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Card skeleton 2 */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <Pulse className="h-5 w-40" />
          <Pulse className="h-5 w-16 rounded-full" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3.5">
            <Pulse className="size-7 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Pulse className="h-4 w-3/4" />
              <Pulse className="h-3 w-1/2" />
            </div>
            <Pulse className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ConnectionBanner({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-2">
      <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-medium text-amber-900">
        <span className="size-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
        <span>{message}</span>
      </div>
    </div>
  )
}
