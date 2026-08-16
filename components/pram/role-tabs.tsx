'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import type { Role } from '@/lib/pram-data'

const roles: { id: Role; label: string }[] = [
  { id: 'mentor', label: 'Panel Mentor' },
  { id: 'estudiante', label: 'Estudiante' },
  { id: 'director', label: 'Dirección & Auditoría' },
]

export function RoleTabs({
  active,
  onSelect,
}: {
  active: Role
  onSelect: (role: Role) => void
}) {
  return (
    <div
      role="tablist"
      aria-label="Seleccionar rol"
      className="inline-flex max-w-full items-center gap-1 rounded-2xl bg-slate-200/60 p-1 shadow-2xs"
    >
      {roles.map((role) => {
        const isActive = active === role.id
        return (
          <button
            key={role.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onSelect(role.id)}
            className={cn(
              'rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
              isActive
                ? 'bg-white text-[#152642] shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            )}
          >
            {role.label}
          </button>
        )
      })}
    </div>
  )
}
