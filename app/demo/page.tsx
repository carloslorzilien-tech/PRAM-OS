import React from 'react'
import {
  getPublicKPIs,
  getTopMentores,
  getMentorSessions,
  getPendingSessionsForAudit,
} from '@/lib/db'
import { DemoTabsView } from '@/components/pram/demo-tabs'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Simulador y Demo de Roles · PRAM OS',
  description: 'Prueba interactiva de vistas Pública, Mentor y Dirección en tiempo real.',
}

export default async function DemoPage() {
  const kpis = await getPublicKPIs()
  const topMentores = await getTopMentores(5)
  const mentorData = await getMentorSessions('m-1')
  const pendingSessions = await getPendingSessionsForAudit()

  return (
    <DemoTabsView
      kpis={kpis}
      topMentores={topMentores}
      mentorData={{
        mentor: mentorData.mentor || topMentores[0],
        sesiones: mentorData.sesiones,
      }}
      pendingSessions={pendingSessions}
    />
  )
}
