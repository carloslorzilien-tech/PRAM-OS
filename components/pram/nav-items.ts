import { House, Trophy, ClipboardCheck, Route, ShieldCheck } from 'lucide-react'

export type SectionId = 'inicio' | 'rankings' | 'checkpoint' | 'micro-rutas' | 'auditoria'

export const navItems: {
  id: SectionId
  label: string
  icon: typeof House
}[] = [
  { id: 'inicio', label: 'Mi Panel', icon: House },
  { id: 'rankings', label: 'Rankings', icon: Trophy },
  { id: 'checkpoint', label: 'Checkpoint', icon: ClipboardCheck },
  { id: 'micro-rutas', label: 'Micro-Rutas', icon: Route },
  { id: 'auditoria', label: 'Auditoría', icon: ShieldCheck },
]
