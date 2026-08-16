'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { navItems, type SectionId } from './nav-items'

export function Sidebar({
  active,
  onSelect,
}: {
  active: SectionId
  onSelect: (id: SectionId) => void
}) {
  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 flex-col border-r border-slate-200/80 bg-white px-3 py-6 md:flex">
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 px-3">
        Menú de Aprendizaje
      </div>
      <nav className="flex flex-col gap-1.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all cursor-pointer text-left',
                isActive
                  ? 'bg-[#152642] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="size-4.5 shrink-0" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
