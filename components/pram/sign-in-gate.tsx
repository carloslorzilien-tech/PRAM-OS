'use client'

import React from 'react'

/**
 * SignInGate — Pase pasivo para Fase 1 de Migración a Firebase
 */
export function SignInGate({
  children,
}: {
  children: React.ReactNode
  isSignedIn?: boolean
  message?: string
}) {
  return <>{children}</>
}
