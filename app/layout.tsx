import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Lora, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { PramProvider } from '@/lib/pram-context'
import { ToastContainer } from '@/components/pram/toast'

const lora = Lora({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-lora',
  display: 'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PRAM · Programa de Refuerzo Académico Minerva Mirabal',
  description:
    'Plataforma de refuerzo académico Minerva Mirabal: sesiones, checkpoints, validación dual MINERD y modelo Phygital.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PRAM',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#152642',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${lora.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} bg-background`}>
      <body className="font-sans antialiased text-foreground bg-background">
        <PramProvider>
          {children}
        </PramProvider>
        <ToastContainer />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
