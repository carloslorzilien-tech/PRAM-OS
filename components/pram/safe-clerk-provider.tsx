'use client'

import React from 'react'

export function SafeClerkProvider({ children }: { children: React.ReactNode; publishableKey?: string }) {
  return <>{children}</>
}
