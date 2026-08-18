import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { SafeClerkProvider } from '@/components/pram/safe-clerk-provider'
import { InstallPrompt } from '@/components/pram/install-prompt'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PRAM OS · Sistema de Refuerzo Académico',
  description:
    'Sistema de gestión de tutorías y acreditación de servicio social para estudiantes de secundaria · Liceo Minerva Mirabal.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/pram-icon.png', type: 'image/png', sizes: '512x512' },
      { url: '/pram-logo.svg', type: 'image/svg+xml' },
    ],
    apple: '/pram-icon.png',
    shortcut: '/pram-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PRAM OS',
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
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  return (
    <html
      lang="es"
      className={`${plusJakarta.variable} ${jetbrainsMono.variable} bg-slate-50`}
    >
      <body className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 selection:bg-slate-900 selection:text-white">
        <SafeClerkProvider publishableKey={clerkKey}>
          {children}
          <InstallPrompt />
        </SafeClerkProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
