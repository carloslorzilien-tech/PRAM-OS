'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { navItems, type SectionId } from './nav-items'

export function BottomNav({
  active,
  onSelect,
}: {
  active: SectionId
  onSelect: (id: SectionId) => void
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md pb-safe md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-0.5 px-2 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-md py-1.5 transition-colors cursor-pointer',
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="size-4.5 shrink-0" />
              <span className="text-[9px] font-medium tracking-tight leading-tight">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
